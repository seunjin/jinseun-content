import { motion } from "motion/react";
const ModalContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      className="bg-background border rounded-md px-4 py-4 w-[min(100%,360px)]"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
    >
      {children}
    </motion.div>
  );
};

export default ModalContainer;
