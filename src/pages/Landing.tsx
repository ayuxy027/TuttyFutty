import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Landing = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Show PIN input after email is entered (and name for register)
  useEffect(() => {
    if (isLogin) {
      setShowPin(email.length > 0);
    } else {
      setShowPin(email.length > 0 && name.length > 0);
    }
  }, [email, name, isLogin]);

  // Email validation - must contain @
  const validateEmail = (email: string): boolean => {
    return email.includes("@") && email.length >= 3 && email.length <= 254;
  };

  // PIN validation - must be exactly 4 digits
  const validatePin = (pin: string): boolean => {
    return /^\d{4}$/.test(pin);
  };

  // Name validation - required for register
  const validateName = (name: string): boolean => {
    if (!name || name.length < 2 || name.length > 50) return false;
    const nameRegex = /^[a-zA-Z\u00C0-\u00FF][a-zA-Z\u00C0-\u00FF\s'-]*[a-zA-Z\u00C0-\u00FF]$/;
    return nameRegex.test(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend validation on submit only
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isLogin && !validateName(name)) {
      setError("Name must be 2-50 characters (letters, spaces, hyphens, apostrophes only)");
      return;
    }

    if (!validatePin(pin)) {
      setError("Please enter a valid 4-digit PIN");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email.trim().toLowerCase(), pin);
      } else {
        await register(email.trim().toLowerCase(), pin, name.trim());
      }
      navigate("/workspace");
    } catch (err: any) {
      // Don't leak specific errors for security
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear all state when switching modes to prevent pollution
    setEmail("");
    setName("");
    setPin("");
    setError("");
    setShowPin(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-5 text-center w-full max-w-md"
      >
        <h1 className="text-4xl font-semibold tracking-tight text-primary">
          TuttyFutty
        </h1>
        <p className="text-sm text-muted-foreground">
          A precision learning environment. Structure your knowledge.
          Master any topic through deliberate practice.
        </p>

        <Card className="w-full mt-4 border-muted/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{isLogin ? "Login" : "Register"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Input
                    placeholder="what do we call you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-muted/50 bg-background/50"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </motion.div>
              )}

              <motion.div
                key="email-field"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: isLogin ? 0.05 : 0.1 }}
                className="space-y-2"
              >
                <Input
                  type="email"
                  placeholder="your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-muted/50 bg-background/50"
                  required
                  minLength={3}
                  maxLength={254}
                  autoComplete="email"
                />
              </motion.div>

              <AnimatePresence mode="wait">
                {showPin && (
                  <motion.div
                    key="pin-section"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <p className="text-xs text-muted-foreground text-center">enter your 4-digit pin</p>
                    <div className="flex justify-center gap-2">
                      <InputOTP
                        value={pin}
                        onChange={setPin}
                        maxLength={4}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="h-12 w-12 border-muted/50 bg-background/50 text-base transition-all duration-200" />
                          <InputOTPSlot index={1} className="h-12 w-12 border-muted/50 bg-background/50 text-base transition-all duration-200" />
                          <InputOTPSlot index={2} className="h-12 w-12 border-muted/50 bg-background/50 text-base transition-all duration-200" />
                          <InputOTPSlot index={3} className="h-12 w-12 border-muted/50 bg-background/50 text-base transition-all duration-200" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 text-center"
                >
                  {error}
                </motion.p>
              )}

              <AnimatePresence>
                {showPin && (
                  <motion.div
                    key="submit-button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || pin.length !== 4}
                    >
                      {loading ? "Loading..." : isLogin ? "Login" : "Register"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:underline transition-colors"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="absolute bottom-5 font-mono text-xs text-muted-foreground"
      >
        Easy → Expert
      </motion.div>
    </div>
  );
};

export default Landing;
