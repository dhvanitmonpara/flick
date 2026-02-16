import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationTemplateProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationTemplate: React.FC<PaginationTemplateProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const handlePrev = () => {
    if (canGoPrev) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (canGoNext) onPageChange(page + 1);
  };

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrev}
            className={!canGoPrev ? "opacity-50 pointer-events-none" : ""}
          />
        </PaginationItem>

        {/* Showing first few pages */}
        {Array.from({ length: Math.min(3, totalPages) }).map((_, idx) => (
          <PaginationItem key={idx}>
            <PaginationLink
              className="bg-zinc-800 border-zinc-800 cursor-pointer text-zinc-100"
              isActive={page === idx + 1}
              onClick={() => onPageChange(idx + 1)}
            >
              {idx + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* If there are more pages */}
        {totalPages > 3 && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            <PaginationItem
            >
              <PaginationLink
                className="bg-zinc-800 border-zinc-800 cursor-pointer text-zinc-100"
                onClick={() => onPageChange(totalPages)}
                isActive={page === totalPages}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className={!canGoNext ? "opacity-50 pointer-events-none" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationTemplate;
