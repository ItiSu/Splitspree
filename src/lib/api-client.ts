export async function parseReceiptApi(receiptDataUri: string) {
  const response = await fetch('/api/parse-receipt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiptDataUri }),
  });

  if (!response.ok) {
    throw new Error('Failed to parse receipt');
  }

  return await response.json();
}

export async function aiChatApi(command: string, users: string, items: string) {
  const response = await fetch('/api/ai-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ command, users, items }),
  });

  if (!response.ok) {
    throw new Error('Failed to process chat command');
  }

  return await response.json();
}
