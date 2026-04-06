# ClapSplash

<img src="assets/favicons/favicon.svg" alt="ClapSplash Icon" width="64" height="64" />

**Live Application:** [https://clapsplash.vercel.app/](https://clapsplash.vercel.app/)

ClapSplash is a cross-platform, client-side web application that detects a hand clap using your device's microphone and immediately plays a predefined audio file.

The application uses the Web Audio API to process raw microphone input in real time. It binds the microphone feed to an `AnalyserNode` and polls the frequency data at the monitor's native refresh rate. When the energy in the targeted frequency band — which corresponds to the sharp, high-energy transients of a hand clap — exceeds a user-defined threshold, it triggers an HTML5 audio element. A configurable debounce timer ensures that overlapping echoes or sustained noise don't cause the sound to trigger repeatedly.

### Offline / Local Setup

Because ClapSplash accesses the microphone via `navigator.mediaDevices.getUserMedia`, the browser requires a secure context (HTTPS) or a localhost environment to run.

To run the application entirely offline on your local machine:
1. Serve the directory using a web server. If you have Python installed, you can run:
   ```bash
   python3 -m http.server 3000
   ```
2. Open `http://localhost:3000` in your web browser.
3. Click "Start Listening" and allow microphone access when prompted.
4. Adjust the sensitivity threshold to match your microphone's hardware and your current room noise.
5. Clap near the microphone.

### Known Limitations

Microphone hardware and browser AGC (Automatic Gain Control) behaviors vary immensely across devices. A threshold that works perfectly on a desktop Linux setup might be too sensitive for a mobile device. You will need to calibrate the sensitivity slider whenever you switch environments. High ambient background noise — specifically sharp, sudden noises like a door shutting or keys dropping — may trigger false positives.

### Disclaimer for Forks & Mirrors

If you choose to host a fork or mirror of this repository, or add your own audio to a public deployment, you **must** clearly state somewhere visible: *"This is not the original website of ClapSplash, it has been modified."*

I (Uzair Mughal) am strictly not responsible for any audio files, modifications, or content hosted on any fork, copy, or mirror of this repository. The content policies outlined below apply solely to the official deployment at clapsplash.vercel.app.

### Content Policy: A Note on Sounds

When I started ClapSplash, the idea was simple — clap your hands, get a funny reaction. But as the sound pack grew, I had to make some real decisions about what stays and what goes.

Some sounds got rejected not because they aren't funny to some people, but because this is a public website. Anyone can open it. Your little sibling. Someone's kid. Someone going through something difficult. A sound that's hilarious in one context can genuinely make someone uncomfortable in another.

Sexual sounds or suggestive audio — even as "jokes" — have no place on a platform where I have zero control over who's listening. It's not about being boring. It's about basic respect for everyone who lands on this page. Hate speech, slurs, and politically charged content are permanently excluded. A clap shouldn't accidentally ruin someone's day.

I want ClapSplash to be something I'm genuinely proud to show — to anyone. A potential employer. A complete stranger. If I'd be embarrassed explaining why a sound is there, it doesn't belong here. Funny doesn't have to be harmful. The Quandale Dingle pack proves that.

### Author

**Uzair Mughal**
* GitHub: [uzairdeveloper223](https://github.com/uzairdeveloper223)
* Web: [uzair.is-a.dev](https://uzair.is-a.dev/)
* Email: [contact@uzair.is-a.dev](mailto:contact@uzair.is-a.dev)

### License

MIT License

Copyright (c) 2026 Uzair Mughal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
