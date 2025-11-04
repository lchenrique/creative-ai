import { ArrowLeft } from "lucide-react";

export interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}



export const PageHeader = ({ title, description, children }: PageHeaderProps) => {

    return <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
                <ArrowLeft className="size-8 rounded-lg flex items-center justify-center" />
                <div>
                    <h1 className="font-semibold text-lg">{title}</h1>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </div>
    </header>
}