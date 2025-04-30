
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const StatsSkeleton = ({ category = "user" }: { category?: "user" | "course" | "financial" | "payment" }) => {
  // Unified styling for skeleton
  const styles = {
    card: "bg-white/50 border-gray-100/50 rounded-xl",
    skeletonBg: "from-gray-200/80 to-gray-200/40",
    shimmerBg: "from-transparent via-white/60 to-transparent"
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Text element loading animation
  const shimmerAnimation = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%", 
      transition: { 
        repeat: Infinity, 
        repeatType: "loop" as const,
        duration: 1.5, 
        ease: "linear"
      }
    }
  };

  return (
    <div className="space-y-8">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {[1, 2, 3, 4].map((i) => (
          <motion.div key={i} variants={item}>
            <Card className={`relative overflow-hidden backdrop-blur-sm ${styles.card}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="relative w-24 overflow-hidden">
                  <Skeleton className={`h-5 w-full bg-gradient-to-r ${styles.skeletonBg}`} />
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${styles.shimmerBg}`}
                    variants={shimmerAnimation}
                    initial="initial"
                    animate="animate"
                  />
                </div>
                <Skeleton className={`h-8 w-8 rounded-full bg-gradient-to-r ${styles.skeletonBg}`} />
              </CardHeader>
              <CardContent>
                <div className="relative overflow-hidden w-20 mb-2">
                  <Skeleton className={`h-7 w-full bg-gradient-to-r ${styles.skeletonBg}`} />
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${styles.shimmerBg}`}
                    variants={shimmerAnimation}
                    initial="initial"
                    animate="animate"
                  />
                </div>
                <div className="relative overflow-hidden w-32">
                  <Skeleton className={`h-4 w-full bg-gradient-to-r ${styles.skeletonBg}`} />
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${styles.shimmerBg}`}
                    variants={shimmerAnimation}
                    initial="initial"
                    animate="animate"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
