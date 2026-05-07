'use client';

import React, { useState } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface ReplyComposerProps {
  onSend: (message: string, attachments?: File[]) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function ReplyComposer({
  onSend,
  placeholder = 'Type your reply...',
  disabled = false,
  className = ''
}: ReplyComposerProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    setSending(true);
    setError(null);

    try {
      await onSend(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  return (
    <div className={`rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden ${className}`}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border-b border-white/[0.08]">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg"
            >
              <Paperclip className="w-3 h-3 text-white/50" />
              <span className="text-sm text-white/70 truncate max-w-[120px]">
                {file.name}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="p-1 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          rows={4}
          className="w-full bg-transparent text-white placeholder-white/40 resize-none focus:outline-none disabled:opacity-50"
        />
        
        {error && (
          <p className="text-sm text-red-400 mt-2 mb-2">{error}</p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || sending}
              />
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Paperclip className="w-4 h-4" />
                <span>Attach</span>
              </div>
            </label>
          </div>

          <button
            onClick={handleSend}
            disabled={disabled || sending || (!message.trim() && attachments.length === 0)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          >
            {sending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
