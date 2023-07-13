import React, { ChangeEventHandler, ReactElement } from 'react';

interface Props {
    label: string;
    value: any;
    type: string;
    setValue: ChangeEventHandler<HTMLInputElement>;
}

export default function Input({ type, label, value, setValue }: Props): ReactElement {
    return (
        <div>
            <label>{label}</label>
            <input type={type} value={value} onChange={setValue} />
        </div>
    )
}
