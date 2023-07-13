import { ReactElement, ReactNode } from 'react'

interface Props {
    children: ReactNode;
}

export default function FilterPanel({ children }: Props): ReactElement {

    return (
        <div className="wrapper">
            {children}
        </div>
    )
}
