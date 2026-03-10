import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Lock } from "lucide-react";

const sprintSteps = [
  { step: 1, title: "Foundations", desc: "Core concepts and terminology", quizzesPassed: 3, quizzesRequired: 3 },
  { step: 2, title: "Building Blocks", desc: "Key mechanisms and patterns", quizzesPassed: 3, quizzesRequired: 3 },
  { step: 3, title: "Intermediate", desc: "Connecting concepts together", quizzesPassed: 1, quizzesRequired: 3 },
  { step: 4, title: "Applied", desc: "Real-world applications", quizzesPassed: 0, quizzesRequired: 3 },
  { step: 5, title: "Advanced", desc: "Edge cases and deep dives", quizzesPassed: 0, quizzesRequired: 3 },
  { step: 6, title: "Synthesis", desc: "Cross-domain connections", quizzesPassed: 0, quizzesRequired: 3 },
  { step: 7, title: "Expert", desc: "Interview-ready mastery", quizzesPassed: 0, quizzesRequired: 3 },
];

const SprintView = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();

  const currentStep = 3; // mock

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-grid-2 border-b border-boundary px-grid-3 py-grid-2">
        <button
          onClick={() => navigate("/workspace")}
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
        </button>
        <h2 className="font-mono text-sm font-semibold text-primary">
          Sprint Roadmap
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        {/* Vertical timeline */}
        <div className="relative ml-grid-3">
          {/* Line */}
          <div className="absolute left-0 top-0 h-full w-[1px] bg-boundary" />

          {sprintSteps.map((step, i) => {
            const isComplete = step.quizzesPassed >= step.quizzesRequired;
            const isCurrent = step.step === currentStep;
            const isLocked = step.step > currentStep;

            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-grid-4 pl-grid-4"
              >
                {/* Node on timeline */}
                <div
                  className={`absolute -left-[5px] top-[2px] flex h-[10px] w-[10px] items-center justify-center rounded-full border ${
                    isComplete
                      ? "border-primary bg-primary"
                      : isCurrent
                      ? "border-primary bg-background"
                      : "border-boundary bg-ground"
                  }`}
                >
                  {isComplete && <Check size={6} className="text-primary-foreground" />}
                </div>

                <div
                  className={`rounded-lg border p-grid-3 transition-colors ${
                    isCurrent
                      ? "border-primary"
                      : isLocked
                      ? "border-boundary opacity-50"
                      : "border-boundary"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-grid">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {String(step.step).padStart(2, "0")}
                        </span>
                        <h3 className="font-mono text-xs font-medium text-primary">
                          {step.title}
                        </h3>
                        {isLocked && <Lock size={10} className="text-muted-foreground" />}
                      </div>
                      <p className="mt-grid font-body text-[10px] text-foreground">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Quiz progress */}
                  {!isLocked && (
                    <div className="mt-grid-2 flex items-center gap-grid">
                      {Array.from({ length: step.quizzesRequired }).map((_, qi) => (
                        <div
                          key={qi}
                          className={`h-[4px] flex-1 rounded-full ${
                            qi < step.quizzesPassed ? "bg-primary" : "bg-boundary"
                          }`}
                        />
                      ))}
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {step.quizzesPassed}/{step.quizzesRequired}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SprintView;
