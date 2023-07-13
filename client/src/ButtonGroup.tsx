import React, { ReactElement, ReactNode } from 'react'

interface Props {
    children: ReactNode;
}

export default function ButtonGroup({ children }: Props): ReactElement {
    return (
        <div className="wrapper">
            {children}
        </div>
    )
}
