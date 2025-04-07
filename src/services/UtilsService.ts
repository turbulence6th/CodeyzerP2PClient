class UtilsService {
  /**
   * Boyutu okunaklı bir formatta gösterir
   */
  formatSize(size: number): string {
    if (size < 1024) {
      return size.toFixed(1) + " B";
    }

    size /= 1024;
    if (size < 1024) {
      return size.toFixed(1) + " KB";
    }

    size /= 1024;
    if (size < 1024) {
      return size.toFixed(1) + " MB";
    }

    size /= 1024;
    if (size < 1024) {
      return size.toFixed(1) + " GB";
    }

    size /= 1024;
    return size.toFixed(1) + " TB";
  }

  /**
   * Metni panoya kopyalar
   */
  copyToClipboard(text: string): boolean {
    try {
      navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Eski yöntem (desteklenmiyorsa)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }

  /**
   * Input elementinin içeriğini kopyalar
   */
  copyInputValue(inputId: string): boolean {
    const copyText = document.getElementById(inputId) as HTMLInputElement;
    if (copyText) {
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      return document.execCommand("copy");
    }
    return false;
  }
}

export default new UtilsService(); 