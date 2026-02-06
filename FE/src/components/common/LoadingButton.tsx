import { Button, CircularProgress } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

type Props = {
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export default function LoadingButton({ loading, onClick, disabled }: Props) {
  return (
    <Button
      variant="contained"
      color="secondary"
      disableElevation
      startIcon={
        loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <AutoAwesomeIcon />
        )
      }
      onClick={onClick}
      disabled={loading || disabled}
      sx={{
        px: 4,
        background: loading
          ? undefined
          : "linear-gradient(45deg, #ff6b6b, #ff8e53)",
      }}
    >
      {loading ? "Generating..." : "Generate"}
    </Button>
  );
}
