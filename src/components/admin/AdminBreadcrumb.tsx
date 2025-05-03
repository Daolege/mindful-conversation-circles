
import React from 'react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTranslations } from '@/hooks/useTranslations';

interface AdminBreadcrumbProps {
  section: string;
  subsection?: string;
}

const AdminBreadcrumb = ({ section, subsection }: AdminBreadcrumbProps) => {
  const { t } = useTranslations();

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin">{t('admin:adminPanel')}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/admin?tab=${section}`}>{t(`admin:${section}`)}</BreadcrumbLink>
        </BreadcrumbItem>
        {subsection && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-muted-foreground">{subsection}</span>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AdminBreadcrumb;
