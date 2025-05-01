
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { motion } from "framer-motion";

interface PaginatedContentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  children: React.ReactNode;
}

export function PaginatedContent({
  currentPage,
  totalPages,
  onPageChange,
  children,
}: PaginatedContentProps) {
  const getPaginationRange = () => {
    const delta = 1; // Number of pages to show on each side of current page
    
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const range = [];
    
    range.push(1);
    
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);
    
    if (currentPage - delta > 2) {
      range.push('ellipsis-start');
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    if (currentPage + delta < totalPages - 1) {
      range.push('ellipsis-end');
    }
    
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
      
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Pagination className="mx-auto pt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(currentPage - 1)}
                  className={`transition-all duration-200 hover:bg-knowledge-primary hover:text-white ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                />
              </PaginationItem>
              
              {getPaginationRange().map((page, i) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                  return (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return (
                  <PaginationItem key={`page-${page}`}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => onPageChange(page as number)}
                      className={`transition-all duration-200 ${
                        page === currentPage 
                          ? 'bg-knowledge-primary text-white hover:bg-knowledge-primary/90'
                          : 'hover:bg-knowledge-primary/10'
                      }`}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(currentPage + 1)}
                  className={`transition-all duration-200 hover:bg-knowledge-primary hover:text-white ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}
    </motion.div>
  );
}
