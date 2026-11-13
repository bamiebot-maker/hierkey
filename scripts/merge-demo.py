import subprocess
import os
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

def get_duration(file_path):
    res = subprocess.run([FFMPEG, '-i', file_path], stderr=subprocess.PIPE, text=True)
    for line in res.stderr.split('\n'):
        if 'Duration' in line:
            parts = line.strip().split(',')[0].split('Duration:')[1].strip().split(':')
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    return 0.0

def main():
    video_dir = 'recordings/video_raw'
    webms = [f for f in os.listdir(video_dir) if f.endswith('.webm')]
    if not webms:
        print("No webm found!")
        return

    raw_video = os.path.join(video_dir, webms[0])
    raw_dur = get_duration(raw_video)
    print(f"Raw video: {raw_video} (Duration: {raw_dur:.2f}s)")

    # Precise scene audio start timestamps in seconds matching voiceover & browser actions
    scenes = [
        {"file": "recordings/audio/scene1_intro.mp3", "start": 0.5},
        {"file": "recordings/audio/scene2_dashboard.mp3", "start": 16.5},
        {"file": "recordings/audio/scene3_vaults.mp3", "start": 33.0},
        {"file": "recordings/audio/scene4_documents.mp3", "start": 48.0},
        {"file": "recordings/audio/scene5_heartbeat_conclusion.mp3", "start": 63.5},
    ]

    last_scene = scenes[-1]
    last_dur = get_duration(last_scene["file"])
    total_audio_end = last_scene["start"] + last_dur
    total_duration = min(raw_dur, total_audio_end + 2.0) if raw_dur > total_audio_end else total_audio_end + 2.0
    print(f"Total video target duration: {total_duration:.2f}s")

    # Build ffmpeg filter_complex to mix all audio at their exact timestamps
    inputs = ['-i', raw_video]
    filter_parts = []
    for idx, sc in enumerate(scenes):
        inputs.extend(['-i', sc["file"]])
        delay_ms = int(sc["start"] * 1000)
        filter_parts.append(f"[{idx+1}:a]adelay={delay_ms}|{delay_ms}[a{idx+1}];")
    
    mix_inputs = "".join([f"[a{i+1}]" for i in range(len(scenes))])
    filter_complex = "".join(filter_parts) + f"{mix_inputs}amix=inputs={len(scenes)}:normalize=0[aout]"

    output_mp4 = "recordings/hierkey-demo.mp4"
    if os.path.exists(output_mp4):
        try:
            os.remove(output_mp4)
        except Exception:
            pass

    cmd = [
        FFMPEG,
        '-y',
        *inputs,
        '-filter_complex', filter_complex,
        '-map', '0:v',
        '-map', '[aout]',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-t', str(total_duration),
        output_mp4
    ]

    print("Running FFmpeg multiplexing...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:")
        print(res.stderr[-1000:])
    else:
        print(f"SUCCESS! Output created at: {output_mp4}")
        size_mb = os.path.getsize(output_mp4) / (1024 * 1024)
        final_dur = get_duration(output_mp4)
        print(f"Final MP4 Duration: {final_dur:.2f}s (~{final_dur/60:.2f} min), Size: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
