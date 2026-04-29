export interface StatusBundleInput {
  projectName: string;
  phase: string;
  summary: string[];
  nextActions: string[];
}

export function renderStatusBundle(input: StatusBundleInput): string {
  const lines = [
    `PROJECT: ${input.projectName}`,
    `PHASE: ${input.phase}`,
    '',
    'SUMMARY:',
    ...input.summary.map((item) => `- ${item}`),
    '',
    'NEXT_ACTIONS:',
    ...input.nextActions.map((item) => `- ${item}`),
    ''
  ];

  return lines.join('\n');
}
