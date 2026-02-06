import { Button, Tooltip } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

type Props = {
  onFileSelected: (file: File) => void;
};

export default function FileUploadButton({ onFileSelected }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = "";
  };

  return (
    <Tooltip title="PDF, Word (.doc/.docx), TXT">
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadFileIcon />}
        sx={{
          borderColor: "white",
          color: "white",
          "&:hover": { borderColor: "white" },
        }}
      >
        Import File
        <input
          type="file"
          hidden
          accept=".txt,text/plain,.pdf,application/pdf,.doc,.docx,.dot,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
        />
      </Button>
    </Tooltip>
  );
}
