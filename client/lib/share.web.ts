// Web stub: use navigator.share if available, otherwise copy to clipboard
const Share = {
  open: async ({
    message,
    title,
  }: {
    message?: string;
    title?: string;
    subject?: string;
  }) => {
    if (navigator.share) {
      await navigator.share({ title, text: message });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(message ?? "");
    }
  },
};

export default Share;
