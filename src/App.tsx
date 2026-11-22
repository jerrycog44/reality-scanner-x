import { useState } from 'react'
import { CameraPreview } from '@capacitor-community/camera-preview'
import './App.css'

function App() {
  const [active, setActive] = useState(false)
  const [busy, setBusy] = useState(false)
  const [front, setFront] = useState(false)
  const [flash, setFlash] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [status, setStatus] = useState('SYSTEM STANDBY')
  const [error, setError] = useState('')

  const startCamera = async () => {
    if (busy || active) return
    setBusy(true)
    setError('')
    setStatus('INITIALIZING CAMERA')

    try {
      await CameraPreview.start({
        position: 'rear',
        toBack: true,
        enableOpacity: true,
        disableAudio: true,
      })
      setActive(true)
      setFront(false)
      setStatus('OPTICAL SYSTEM ONLINE')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera initialization failed')
      setStatus('CAMERA UNAVAILABLE')
    } finally {
      setBusy(false)
    }
  }

  const stopCamera = async () => {
    if (busy) return
    setBusy(true)
    try {
      await CameraPreview.stop()
      setActive(false)
      setFlash(false)
      setStatus('SYSTEM STANDBY')
    } catch {
      setError('Unable to stop camera')
    } finally {
      setBusy(false)
    }
  }

  const switchCamera = async () => {
    if (!active || busy) return
    setBusy(true)
    try {
      await CameraPreview.flip()
      setFront(!front)
      setFlash(false)
    } catch {
      setError('Camera switch failed')
    } finally {
      setBusy(false)
    }
  }

  const toggleFlash = async () => {
    if (!active || busy || front) return
    setBusy(true)
    try {
      await CameraPreview.setFlashMode({
        flashMode: flash ? 'off' : 'torch',
      })
      setFlash(!flash)
    } catch {
      setError('Flash unavailable on this camera')
    } finally {
      setBusy(false)
    }
  }

  const capture = async () => {
    if (!active || busy) return
    setBusy(true)
    setError('')
    try {
      const result = await CameraPreview.capture({ quality: 90 })
      setPhoto(`data:image/jpeg;base64,${result.value}`)
      setStatus('IMAGE CAPTURED')
    } catch {
      setError('Image capture failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="scanner">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">R<span>X</span></span>
          <div>
            <strong>REALITY SCANNER</strong>
            <small>ADVANCED OPTICAL SYSTEM</small>
          </div>
        </div>
        <span className={`live-indicator ${active ? 'on' : ''}`}>
          {active ? 'LIVE' : 'OFFLINE'}
        </span>
      </header>

      <section className="viewport">
        <div className="grid-overlay" />
        <div className="scan-frame">
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div className="crosshair">+</div>
          {active && <div className="scan-line" />}
          {!active && (
            <div className="camera-placeholder">
              <div className="aperture">◎</div>
              <strong>OPTICAL SENSOR</strong>
              <span>CAMERA NOT INITIALIZED</span>
              <button onClick={startCamera} disabled={busy}>
                {busy ? 'INITIALIZING...' : 'INITIALIZE CAMERA'}
              </button>
            </div>
          )}
        </div>

        <div className="view-label">
          <span>CAM 01 / {front ? 'FRONT' : 'REAR'}</span>
          <span>1080P · AUTO</span>
        </div>
      </section>

      <section className="telemetry">
        <div>
          <small>SYSTEM STATUS</small>
          <strong>{status}</strong>
        </div>
        <div>
          <small>OPTICAL MODE</small>
          <strong>{active ? 'ACTIVE' : 'STANDBY'}</strong>
        </div>
        <div>
          <small>CAPTURE ENGINE</small>
          <strong>READY</strong>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}

      <section className="controls">
        <button className="utility" onClick={toggleFlash} disabled={!active || front || busy}>
          <span>ϟ</span>
          {flash ? 'FLASH ON' : 'FLASH'}
        </button>

        <button className="shutter" onClick={capture} disabled={!active || busy}>
          <span />
        </button>

        <button className="utility" onClick={switchCamera} disabled={!active || busy}>
          <span>⇄</span>
          SWITCH
        </button>
      </section>

      <button
        className={`power-button ${active ? 'powered' : ''}`}
        onClick={active ? stopCamera : startCamera}
        disabled={busy}
      >
        {busy ? 'PLEASE WAIT...' : active ? '■  STOP CAMERA' : '◉  START CAMERA'}
      </button>

      <footer>
        <span>REALITY SCANNER X</span>
        <span>BUILD 001 · ANDROID</span>
      </footer>

      {photo && (
        <div className="photo-modal">
          <div className="photo-card">
            <div className="photo-heading">
              <strong>CAPTURE COMPLETE</strong>
              <button onClick={() => setPhoto(null)}>✕</button>
            </div>
            <img src={photo} alt="Captured camera frame" />
            <a href={photo} download="reality-scan.jpg">SAVE IMAGE</a>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
