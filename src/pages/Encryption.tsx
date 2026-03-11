import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Star, Heart } from "lucide-react";

const SAMPLES = [
  "sync call with josh",
  "interview at 2 PM",
  "review auden's pull request",
  "finish the quarterly report",
  "team standup tomorrow",
  "dentist appointment Friday",
  "send invoice to client",
];

const simpleEncrypt = (text: string): string => {
  const encoded = new TextEncoder().encode(text);
  const hash = Array.from(encoded).map((b, i) => {
    const key = (i * 7 + 13) % 256;
    return (b ^ key).toString(16).padStart(2, "0");
  });
  const fullHash = hash.join("");
  return fullHash.slice(0, 64);
};

const Encryption = () => {
  const [input, setInput] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const sampleIndex = useRef(0);
  const charIndex = useRef(0);
  const isTyping = useRef(true);

  useEffect(() => {
    const typeNext = () => {
      const sample = SAMPLES[sampleIndex.current];
      
      if (charIndex.current < sample.length) {
        setInput(sample.slice(0, charIndex.current + 1));
        charIndex.current += 1;
      } else {
        setTimeout(() => {
          charIndex.current = 0;
          sampleIndex.current = (sampleIndex.current + 1) % SAMPLES.length;
          typeNext();
        }, 1500);
        isTyping.current = false;
      }
    };

    if (isTyping.current) {
      const timeout = setTimeout(typeNext, 100);
      return () => clearTimeout(timeout);
    }
  }, [input]);

  useEffect(() => {
    if (input.trim()) {
      setEncrypted(simpleEncrypt(input));
    } else {
      setEncrypted("");
    }
  }, [input]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">Encryption</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        <div className="mx-auto max-w-lg space-y-grid-4">
          <div className="text-center space-y-grid-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-mono text-lg font-semibold text-primary">
              Productivity & Privacy
            </h3>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Your data is end-to-end encrypted and we can never access it.
            </p>
            <div className="flex items-center justify-center gap-1 pt-1">
              <span className="text-xs text-muted-foreground">Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              <span className="text-xs text-muted-foreground">for Productivity and Privacy</span>
            </div>
            <a
              href="https://github.com/ayuxy027/TuttyFutty"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Star className="h-3 w-3" />
              Star us on GitHub
            </a>
          </div>

          <div className="rounded-lg border border-boundary bg-cell p-grid-3 space-y-grid-3">
            <div className="flex items-center gap-2 text-primary">
              <Lock className="h-4 w-4" strokeWidth={1.5} />
              <span className="font-mono text-xs font-medium">Encryption</span>
            </div>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a secret message..."
              className="w-full rounded-lg border border-boundary bg-background px-grid-2 py-grid font-mono text-xs text-primary placeholder:text-muted-foreground"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: encrypted ? 1 : 0 }}
              className="space-y-2"
            >
              <div className="rounded-lg border border-boundary bg-background p-grid-2 font-mono text-[10px] text-primary break-all min-h-[44px]">
                {encrypted}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-muted-foreground">
                  {input.length} chars → {encrypted.length} encrypted
                </span>
                {encrypted && (
                  <button
                    onClick={() => { setInput(""); setEncrypted(""); charIndex.current = 0; sampleIndex.current = 0; }}
                    className="font-mono text-[9px] text-muted-foreground hover:text-primary"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Encryption;
