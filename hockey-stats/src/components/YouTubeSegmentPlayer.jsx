import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Plays a segment of a YouTube video (startSeconds -> endSeconds),
 * loops the segment, and supports playback speed.
 *
 * Tap-to-play (no autoplay).
 */
export default function YouTubeSegmentPlayer({
  videoId,
  startSeconds = 0,
  endSeconds = 0,
  loop = true,
  defaultRate = 1,
}) {
  const containerId = useMemo(
    () => `yt-${videoId}-${Math.random().toString(36).slice(2)}`,
    [videoId]
  );

  const playerRef = useRef(null);
  const timerRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [rates, setRates] = useState([1]);
  const [rate, setRate] = useState(defaultRate);

  const validSegment =
    Number.isFinite(startSeconds) &&
    Number.isFinite(endSeconds) &&
    endSeconds > startSeconds &&
    startSeconds >= 0;

  // Load YouTube IFrame API once
  useEffect(() => {
    if (window.YT && window.YT.Player) return;

    const existing = document.getElementById("youtube-iframe-api");
    if (existing) return;

    const tag = document.createElement("script");
    tag.id = "youtube-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  // Create/destroy player
  useEffect(() => {
    let cancelled = false;

    function cleanup() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
      setIsReady(false);
      setIsPlaying(false);
    }

    cleanup();

    const waitForYT = setInterval(() => {
      if (cancelled) return;
      if (window.YT && window.YT.Player) {
        clearInterval(waitForYT);

        if (!validSegment) return;

        playerRef.current = new window.YT.Player(containerId, {
          width: "100%",
          height: "100%",
          videoId,
          playerVars: {
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            start: Math.floor(startSeconds),
          },
          events: {
            onReady: (e) => {
              if (cancelled) return;
              setIsReady(true);

              const available = e.target.getAvailablePlaybackRates?.() || [1];
              setRates(available);

              const initial = available.includes(defaultRate) ? defaultRate : 1;
              setRate(initial);
              try { e.target.setPlaybackRate(initial); } catch {}

              // Ensure start is exact
              try { e.target.seekTo(startSeconds, true); } catch {}

              // Loop watcher
              timerRef.current = setInterval(() => {
                try {
                  const p = playerRef.current;
                  if (!p) return;

                  const t = p.getCurrentTime?.() ?? 0;

                  // If scrubbed before start, pull back
                  if (t < startSeconds - 0.4) {
                    p.seekTo(startSeconds, true);
                    return;
                  }

                  // Hit end -> loop or pause
                  if (t >= endSeconds - 0.15) {
                    if (loop) {
                      p.seekTo(startSeconds, true);
                      // keep playing if they were playing
                      p.playVideo?.();
                    } else {
                      p.pauseVideo?.();
                    }
                  }
                } catch {}
              }, 250);
            },
            onStateChange: (e) => {
              // 1 = playing, 2 = paused, 0 = ended
              if (cancelled) return;
              setIsPlaying(e.data === 1);

              // If ended, bounce back if looping
              if (e.data === 0 && loop && validSegment) {
                try {
                  e.target.seekTo(startSeconds, true);
                  e.target.playVideo?.();
                } catch {}
              }
            },
          },
        });
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(waitForYT);
      cleanup();
    };
  }, [containerId, videoId, startSeconds, endSeconds, loop, defaultRate, validSegment]);

  function togglePlay() {
    const p = playerRef.current;
    if (!p || !isReady) return;
    if (isPlaying) p.pauseVideo?.();
    else p.playVideo?.();
  }

  function changeRate(newRate) {
    const p = playerRef.current;
    setRate(newRate);
    if (!p || !isReady) return;
    try { p.setPlaybackRate(newRate); } catch {}
  }

  if (!validSegment) {
    return (
      <div className="ytShell">
        <div className="ytError">
          Invalid clip segment. (end must be greater than start)
        </div>
      </div>
    );
  }

  return (
    <div className="ytShell">
      <div className="ytPlayerWrap">
        <div id={containerId} className="ytPlayer" />
      </div>

      <div className="ytControls">
        <button onClick={togglePlay} disabled={!isReady}>
          {isPlaying ? "Pause" : "Tap to Play Clip"}
        </button>

        <div className="ytRate">
          <label>Speed</label>
          <select
            value={rate}
            onChange={(e) => changeRate(Number(e.target.value))}
            disabled={!isReady}
          >
            {rates.map((r) => (
              <option key={r} value={r}>{r}x</option>
            ))}
          </select>
        </div>

        <div className="ytMeta">
          <span>Loop: {loop ? "On" : "Off"}</span>
          <span>Segment: {formatTime(startSeconds)}–{formatTime(endSeconds)}</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}
