const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

const dateAgoShort = dateStr => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const years = Math.floor(diff / YEAR_MS);
  if (years > 0) return years + " years ago";
  const months = Math.floor(diff / MONTH_MS);
  if (months > 0) return months + " months ago";
  const days = Math.floor(diff / DAY_MS);
  if (days > 0) return days + " days ago";
  const hours = Math.floor(diff / HOUR_MS);
  if (hours > 0) return hours + " hours ago";
  return "just now";
};

export default dateAgoShort;
