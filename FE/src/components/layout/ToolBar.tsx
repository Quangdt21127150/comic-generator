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
import GenerateButton from "../common/GenerateButton";
import DownloadButton from "../common/DownloadButton";

type Props = {
  style: string;
  setStyle: (v: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onFileSelected: (file: File) => void;
  generatedImages: string[];
  onDownloadAll: () => void;
};

const styles = [
  { value: "dong-ho", label: "Dong Ho painting" },
  { value: "manga", label: "Manga" },
  { value: "pixel", label: "Pixel" },
];

export default function AppToolbar({
  style,
  setStyle,
  isGenerating,
  onGenerate,
  onFileSelected,
  generatedImages,
  onDownloadAll,
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

        <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
          <InputLabel
            sx={{
              color: "white",
              fontWeight: 500,
              "&.Mui-focused": { color: "#ff8e53" },
            }}
          >
            Style
          </InputLabel>
          <Select
            value={style}
            label="Style"
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

        <GenerateButton
          loading={isGenerating}
          onClick={onGenerate}
          disabled={!isGenerating && false}
        />

        <DownloadButton
          variant="text"
          size="medium"
          disabled={generatedImages.length === 0 || isGenerating}
          onClick={onDownloadAll}
          label="Download Comic"
          tooltip="Download Comic"
        />
      </Toolbar>
    </AppBar>
  );
}
