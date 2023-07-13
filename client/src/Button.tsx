import React, { MouseEventHandler, ReactElement } from 'react'

interface Props {
    text: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}

export default function Button({ text, onClick, disabled = false }: Props): ReactElement {
    return (
        <button onClick={onClick} disabled={disabled}>{text}</button>
    )
}
