$script_dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $script_dir

$uv_from_path = (Get-Command uv -ErrorAction SilentlyContinue)
$uv_local = Join-Path (Split-Path -Parent $script_dir) ".uv\uv.exe"
if ($uv_from_path) {
	$uv_cmd = $uv_from_path.Source
} elseif (Test-Path $uv_local) {
	$uv_cmd = $uv_local
} else {
	throw "uv not found. Install it or place it at $uv_local"
}

$venv_dir = Join-Path $script_dir ".venv311"
$venv_python = Join-Path $venv_dir "Scripts\python.exe"
if (-not (Test-Path $venv_python)) {
	& $uv_cmd venv --python 3.11 $venv_dir
}

$sync_marker = Join-Path $venv_dir ".kokoro-gpu-sync.stamp"
$pyproject_file = Join-Path $script_dir "pyproject.toml"
$needs_sync = $true
if (Test-Path $sync_marker) {
	$marker_time = (Get-Item $sync_marker).LastWriteTimeUtc
	$pyproject_time = (Get-Item $pyproject_file).LastWriteTimeUtc
	if ($marker_time -ge $pyproject_time) {
		$needs_sync = $false
	}
}

$env:PHONEMIZER_ESPEAK_LIBRARY="C:\Program Files\eSpeak NG\libespeak-ng.dll"
$env:PYTHONUTF8=1
$Env:PROJECT_ROOT="$script_dir"
$Env:USE_GPU="true"
$Env:USE_ONNX="false"
$Env:PYTHONPATH="$Env:PROJECT_ROOT;$Env:PROJECT_ROOT/api"
$Env:MODEL_DIR="src/models"
$Env:VOICES_DIR="src/voices/v1_0"
$Env:WEB_PLAYER_PATH="$Env:PROJECT_ROOT/web"
$Env:TEMP_FILE_DIR = Join-Path $script_dir "temp_files"
if ($needs_sync) {
	& $uv_cmd pip install --python $venv_python -e ".[gpu]"
	if ($LASTEXITCODE -ne 0) {
		throw "Editable package install failed."
	}

	& $uv_cmd pip install --python $venv_python "en-core-web-sm @ https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl"
	if ($LASTEXITCODE -ne 0) {
		Write-Warning "Optional NLP model install failed (en-core-web-sm). Continuing startup."
	}
	New-Item -ItemType File -Path $sync_marker -Force | Out-Null
}

if (-not ((Test-Path (Join-Path $script_dir "api/src/models/v1_0/kokoro-v1_0.pth")) -and (Test-Path (Join-Path $script_dir "api/src/models/v1_0/config.json")))) {
	& $venv_python docker/scripts/download_model.py --output api/src/models/v1_0
}
& $venv_python -m uvicorn api.src.main:app --host 0.0.0.0 --port 8880