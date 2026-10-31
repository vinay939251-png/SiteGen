import { useState, useCallback, useEffect, useRef } from 'react';
import { useSiteStore } from '../../../store/siteStore';
import SunCalc from 'suncalc';

export function SunTab() {
  const sunData = useSiteStore((s) => s.sunData);
  const setSunData = useSiteStore((s) => s.setSunData);
  const site = useSiteStore((s) => s.site);

  const [timePreset, setTimePreset] = useState<string>('noon');
  const [currentHourDecimal, setCurrentHourDecimal] = useState<number>(12);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 1x, 2x, 4x

  const animRef = useRef<number | null>(null);

  // Update solar azimuth and altitude based on decimal hour
  const updateSunPosition = useCallback(
    (hourDecimal: number) => {
      setCurrentHourDecimal(hourDecimal);
      const date = new Date(sunData.date);
      const hours = Math.floor(hourDecimal);
      const minutes = Math.floor((hourDecimal - hours) * 60);
      date.setHours(hours, minutes, 0, 0);

      const pos = SunCalc.getPosition(date, site.coordinates.lat, site.coordinates.lng);
      setSunData({
        azimuth: (pos.azimuth * 180) / Math.PI + 180,
        altitude: Math.max(0, (pos.altitude * 180) / Math.PI),
        date,
      });
    },
    [site.coordinates, sunData.date, setSunData]
  );

  // Animation Loop for smooth daylight sweep (6 AM to 6 PM)
  useEffect(() => {
    if (!isPlaying || !sunData.sunEnabled) {
      if (animRef.current) clearInterval(animRef.current);
      return;
    }

    const interval = setInterval(() => {
      setCurrentHourDecimal((prev) => {
        let next = prev + 0.1 * playSpeed;
        if (next > 18.0) next = 6.0; // Loop back to 6 AM
        updateSunPosition(next);
        return next;
      });
    }, 50);

    animRef.current = interval as unknown as number;
    return () => clearInterval(interval);
  }, [isPlaying, sunData.sunEnabled, playSpeed, updateSunPosition]);

  const handlePreset = (preset: string) => {
    setIsPlaying(false);
    setTimePreset(preset);
    switch (preset) {
      case 'morning':
        updateSunPosition(8.5);
        break;
      case 'noon':
        updateSunPosition(12.0);
        break;
      case 'evening':
        updateSunPosition(16.5);
        break;
    }
  };

  const toggleSun = () => {
    const newEnabled = !sunData.sunEnabled;
    setSunData({ sunEnabled: newEnabled });
    if (newEnabled) {
      handlePreset('noon');
    } else {
      setIsPlaying(false);
    }
  };

  // Format hour decimal to 12-hour AM/PM string
  const formatTime = (hDec: number) => {
    const h = Math.floor(hDec);
    const m = Math.floor((hDec - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${period}`;
  };

  return (
    <div>
      {/* ─── Simulation Master Toggle ─── */}
      <div className="panel-section">
        <div className="sun-toggle" onClick={toggleSun}>
          <div className="sun-toggle-label">
            <span className="sun-toggle-icon">☼</span>
            Astronomical Sun & Shadow Simulation
          </div>
          <div className={`toggle-switch ${sunData.sunEnabled ? 'active' : ''}`} />
        </div>
      </div>

      {sunData.sunEnabled && (
        <>
          {/* ─── Animated Day Playback Controls ─── */}
          <div className="panel-section" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="panel-section-title" style={{ margin: 0, color: '#F59E0B' }}>
                DAYLIGHT SWEEP
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f5' }}>
                {formatTime(currentHourDecimal)}
              </span>
            </div>

            {/* Play/Pause & Speed Buttons */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <button
                type="button"
                className={`btn btn-sm ${isPlaying ? 'btn-primary' : ''}`}
                style={{ flex: 2, padding: '4px 8px', fontSize: 11 }}
                onClick={() => setIsPlaying(!isPlaying)}
                id="btn-play-sun"
              >
                {isPlaying ? '⏸ Pause Daylight Sweep' : '▶ Animate Sun Path'}
              </button>

              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    fontSize: 10,
                    padding: '4px 6px',
                    background: playSpeed === spd ? 'var(--accent-blue)' : 'var(--surface-primary)',
                  }}
                  onClick={() => setPlaySpeed(spd)}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Continuous Time Slider */}
            <div className="slider-group" style={{ marginBottom: 4 }}>
              <input
                type="range"
                min={6.0}
                max={18.0}
                step={0.1}
                value={currentHourDecimal}
                onChange={(e) => {
                  setIsPlaying(false);
                  setTimePreset('');
                  updateSunPosition(Number(e.target.value));
                }}
                id="slider-sun-decimal"
              />
              <div className="slider-ticks" style={{ fontSize: 9 }}>
                <span>6 AM</span>
                <span>9 AM</span>
                <span>12 PM</span>
                <span>3 PM</span>
                <span>6 PM</span>
              </div>
            </div>
          </div>

          {/* ─── Quick Time Presets ─── */}
          <div className="panel-section">
            <div className="panel-section-title">SOLAR PRESETS</div>
            <div className="time-presets">
              <button
                className={`time-preset ${timePreset === 'morning' ? 'active' : ''}`}
                onClick={() => handlePreset('morning')}
                id="btn-sun-morning"
              >
                🌅 Morning (8:30 AM)
              </button>
              <button
                className={`time-preset ${timePreset === 'noon' ? 'active' : ''}`}
                onClick={() => handlePreset('noon')}
                id="btn-sun-noon"
              >
                ☀️ Solar Noon (12:00 PM)
              </button>
              <button
                className={`time-preset ${timePreset === 'evening' ? 'active' : ''}`}
                onClick={() => handlePreset('evening')}
                id="btn-sun-evening"
              >
                🌇 Evening (4:30 PM)
              </button>
            </div>
          </div>

          {/* ─── Real-time Solar Angle Gauges ─── */}
          <div className="panel-section">
            <div className="panel-section-title">CALCULATED SOLAR METRICS</div>
            <div className="rule-row">
              <span className="rule-label">Compass Azimuth</span>
              <span className="rule-value" style={{ color: '#4C9EEB' }}>{sunData.azimuth.toFixed(1)}°</span>
            </div>
            <div className="rule-row">
              <span className="rule-label">Solar Altitude</span>
              <span className="rule-value" style={{ color: '#F59E0B' }}>{sunData.altitude.toFixed(1)}°</span>
            </div>
            <div className="rule-row">
              <span className="rule-label">Relative Shadow Factor</span>
              <span className="rule-value">
                {sunData.altitude > 5
                  ? `${(1 / Math.tan((sunData.altitude * Math.PI) / 180)).toFixed(1)}× height`
                  : 'Long horizontal'}
              </span>
            </div>
          </div>
        </>
      )}

      <div className="disclaimer">
        <strong>Solar Physics:</strong> Sun azimuth and elevation calculated dynamically with <code>SunCalc</code> using {site.coordinates.lat.toFixed(4)}°N latitude. Shadows render live across the building and surrounding cityscape.
      </div>
    </div>
  );
}
