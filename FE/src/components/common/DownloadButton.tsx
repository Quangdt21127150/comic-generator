import { IconButton, Button, alpha } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

type DownloadButtonProps = {
  variant?: "icon" | "text";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick: () => void;
  label?: string;
  tooltip?: string;
  sx?: object;
};

export default function DownloadButton({
  variant = "icon",
  size = "small",
  disabled = false,
  onClick,
  label = "Download",
  tooltip = "Download",
  sx = {},
}: DownloadButtonProps) {
  if (variant === "icon") {
    return (
      <IconButton
        size={size}
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
        sx={{
          bgcolor: alpha("#000", 0.5),
          color: "white",
          "&:hover": { bgcolor: alpha("#000", 0.75) },
          ...sx,
        }}
      >
        <DownloadIcon fontSize={size === "small" ? "small" : "medium"} />
      </IconButton>
    );
  }

  return (
    <Button
      variant="outlined"
      color="inherit"
      size={size}
      startIcon={<DownloadIcon />}
      onClick={onClick}
      disabled={disabled}
      sx={{
        color: "white",
        borderColor: "rgba(255,255,255,0.5)",
        "&:hover": {
          borderColor: "white",
          bgcolor: "rgba(255,255,255,0.08)",
        },
        "&.Mui-disabled": {
          color: "rgba(255,255,255,0.3)",
          borderColor: "rgba(255,255,255,0.2)",
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
}
