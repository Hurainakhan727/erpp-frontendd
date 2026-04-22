import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function DecisionBanner({ children }: Props) {
  return <div className="decision-banner">⚠ {children}</div>;
}
