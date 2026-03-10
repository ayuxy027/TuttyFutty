import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-grid-3">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-grid-5 text-center"
      >
        <h1 className="text-[40px] font-semibold leading-[1.1] tracking-tight text-primary">
          TuttyFutty
        </h1>
        <p className="max-w-[320px] font-body text-sm leading-relaxed text-foreground">
          A precision learning environment. Structure your knowledge.
          Master any topic through deliberate practice.
        </p>

        <motion.button
          onClick={() => navigate("/workspace")}
          className="chrome-height flex items-center rounded-lg border border-primary bg-primary px-grid-4 font-mono text-xs font-medium text-primary-foreground transition-colors hover:bg-foreground"
          whileTap={{ scale: 0.98 }}
        >
          Enter Workspace
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="absolute bottom-grid-5 font-mono text-[10px] text-muted-foreground"
      >
        Easy → Expert
      </motion.div>
    </div>
  );
};

export default Landing;
