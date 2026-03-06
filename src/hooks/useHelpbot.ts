import { useMutation } from '@tanstack/react-query';
import { helpbotService } from '../api/HelpbotService';

/**
 * SCENARIO: User sends a message in the help chatbot popover
 * CALLS: POST /api/helpbot/chat (HelpbotEndpoints.cs)
 * SIDE EFFECTS:
 *   - Sends message + conversation history to Grok API via backend
 *   - Returns AI response in Swedish about site features
 */
export function useHelpbot() {
    return useMutation({
        mutationFn: ({ message, history }: { message: string; history: Array<{ role: string; content: string }> }) =>
            helpbotService.chat(message, history),
    });
}
