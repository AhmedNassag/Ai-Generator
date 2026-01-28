import Swal from "sweetalert2";
import { notify } from "@kyvg/vue3-notification";
import { createApp, h, nextTick } from "vue";
// import Modal from "@/components/Modal.vue";
import Modal from "@/components/BootstrapModal.vue";

// Format date to readable format
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  try {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };

    return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
  } catch (error) {
    console.error('Date formatting error:', error);
    return "Invalid Date";
  }
};

// Format date without time (short format)
export const formatDateShort = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch (error) {
    return "Invalid Date";
  }
};

// Truncate text to specified length with ellipsis
export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return "";

  try {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  } catch (error) {
    console.error('Text truncation error:', error);
    return "";
  }
};

// Convert HTML tags to plain text (similar to jQuery's .text() method)
export const htmlToText = (html: string | null | undefined, maxLength: number = 50): string => {
  if (!html) return "";

  try {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Get text content and normalize whitespace
    const textContent = truncateText(tempDiv.textContent || tempDiv.innerText || '', maxLength);

    // Clean up extra whitespace and return
    return textContent.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('HTML to text conversion error:', error);

    // Fallback: Use regex to strip HTML tags if DOM method fails
    try {
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    } catch (regexError) {
      console.error('Regex fallback error:', regexError);
      return "";
    }
  }
};

// Alternative method for server-side rendering or when DOM is not available
export const htmlToTextRegex = (html: string | null | undefined): string => {
  if (!html) return "";

  try {
    return html
      .replace(/<br\s*\/?>/gi, '\n') // Replace <br> tags with newlines
      .replace(/<\/p>/gi, '\n') // Replace closing </p> tags with newlines
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .trim();
  } catch (error) {
    console.error('HTML to text regex conversion error:', error);
    return "";
  }
};

// Format date and time in short format
export const formatDateTimeShort = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(date));
  } catch (error) {
    return "Invalid Date";
  }
};

// Format date and time to readable format
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  try {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return "Invalid Date";
  }
};

export const customConfirmationMessage = async (title: string, text: string = "", icon: "warning" | "error" | "info" | "success") => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: icon,
    showCancelButton: true,
    cancelButtonText: "Cancel",
    customClass: {
      confirmButton: 'pk-btn-main',
      cancelButton: 'pk-btn-secondary ms-2'
    },
    buttonsStyling: false,
    confirmButtonText: "Yes, proceed",
  });
};

export const customNotify = (title: string, text: string, type: string) => {
  notify({
    title: title,
    text: text,
    type: type,
  });
};


/**
 * Truncate text and add "See more" that opens custom Modal.vue
 */
export function truncateTextWithModal(text: string, limit = 50, fieldName: string | null = null) {
  if (!text) return "";

  // Truncate text with ellipsis
  const isTruncated = text.length > limit;
  const truncated = isTruncated ? text.substring(0, limit) + "..." : text;

  // If text not truncated — return as plain text
  if (!isTruncated) return truncated;

  // Create unique ID for this instance
  const id = `see-more-${Math.random().toString(36).slice(2, 9)}`;

  // HTML for clickable link
  const seeMoreLink = `
    <a href="#"
      id="${id}"
      class="see-more-link"
      style="color:#6E3894;cursor:pointer;text-decoration:none;font-weight:500;">
      See more
    </a>
  `;

  // Defer DOM event attachment to next render cycle
  nextTick(() => {
    const link = document.getElementById(id);
    if (!link) return;

    // Avoid attaching multiple listeners
    link.onclick = (e) => {
      e.preventDefault();

      // Create a container for dynamic modal instance
      const container = document.createElement("div");
      document.body.appendChild(container);

      // Create a temporary Vue app for modal
      const app = createApp({
        data: () => ({ show: true }),
        render() {
          return h(Modal, {
            modelValue: this.show,
            "onUpdate:modelValue": (val: boolean) => {
              this.show = val;
              if (!val) {
                // Cleanly unmount modal after transition ends
                setTimeout(() => {
                  app.unmount();
                  if (container.parentNode) container.parentNode.removeChild(container);
                }, 300);
              }
            },
            title: fieldName || "Full Content",
            hasSubmit: false,
            showFooter: false,
            size: "large",
          }, {
            default: () => h("div", { style: "white-space: pre-wrap;" }, text),
          });
        },
      });

      app.mount(container);
    };
  });

  // Return combined truncated text and clickable link
  return truncated + seeMoreLink;
};