import {
  AppBar,
  Toolbar,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import FileUploadButton from "../common/FileUploadButton";
import LoadingButton from "../common/LoadingButton";

type Props = {
  pages: number;
  setPages: (v: number) => void;
  style: string;
  setStyle: (v: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onFileSelected: (file: File) => void;
};

const styles = [
  { value: "tranh-dong-ho", label: "Tranh Đông Hồ" },
  { value: "manga", label: "Manga" },
  { value: "pixel", label: "Pixel Art" },
];

export default function AppToolbar({
  pages,
  setPages,
  style,
  setStyle,
  isGenerating,
  onGenerate,
  onFileSelected,
}: Props) {
  return (
    <AppBar position="static" elevation={3}>
      <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 600 }}
        >
          AI Comic Generator
        </Typography>

        <FileUploadButton onFileSelected={onFileSelected} />

        <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
          <InputLabel
            sx={{
              color: "white",
              fontWeight: 500,
              "&.Mui-focused": { color: "#ff8e53" },
            }}
          >
            Số trang
          </InputLabel>
          <Select
            value={pages}
            label="Số trang"
            onChange={(e) => setPages(Number(e.target.value))}
            sx={{
              color: "white",
              transition: "all 0.2s ease",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white !important",
                borderWidth: "2px !important",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ff8e53 !important",
                borderWidth: "2px",
              },
              ".MuiSvgIcon-root": { color: "white" },
            }}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
          <InputLabel
            sx={{
              color: "white",
              fontWeight: 500,
              "&.Mui-focused": { color: "#ff8e53" },
            }}
          >
            Phong cách
          </InputLabel>
          <Select
            value={style}
            label="Phong cách"
            onChange={(e) => setStyle(e.target.value)}
            sx={{
              color: "white",
              transition: "all 0.2s ease",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white !important",
                borderWidth: "2px !important",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ff8e53 !important",
                borderWidth: "2px",
              },
              ".MuiSvgIcon-root": { color: "white" },
            }}
          >
            {styles.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LoadingButton
          loading={isGenerating}
          onClick={onGenerate}
          disabled={!isGenerating && false}
        />
      </Toolbar>
    </AppBar>
  );
}
