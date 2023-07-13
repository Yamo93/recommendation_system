import React, { ReactElement } from 'react';
import { Record } from './App';

interface Props {
  records: Record[];
}

export default function Table({ records }: Props): ReactElement {
  return (
    <div className="wrapper mt">
      <table style={{ width: '50%' }}>
        <thead style={{ width: '100%' }}>
          <tr style={{ width: '100%' }}>
            <th style={{ width: '13%' }}>Name</th>
            <th style={{ width: '83%' }}>ID</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.name}</td>
              <td>{record.id}</td>
              <td>{record.score.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
