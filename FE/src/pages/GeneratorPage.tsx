import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import Toolbar from "../components/layout/ToolBar";
import { generateArt } from "../services/api";
import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function GeneratorPage() {
  const [text, setText] = useState("");
  const [pages, setPages] = useState(3);
  const [style, setStyle] = useState("tranh-dong-ho");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "info",
  ) => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;
  };

  const handleFileSelected = async (file: File) => {
    if (!file) return;

    setIsLoadingFile(true);
    setText("Đang đọc file...");

    try {
      let extractedText = "";

      if (file.type === "text/plain") {
        extractedText = await file.text();
      } else if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().match(/\.(doc|docx)$/)
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        extractedText = await extractTextFromPDF(file);
      } else {
        throw new Error("Định dạng file không được hỗ trợ");
      }

      const trimmed = extractedText.trim();
      setText(trimmed.slice(0, 5000));

      if (trimmed.length > 5000) {
        showToast("File dài quá, chỉ lấy 5000 ký tự đầu.", "warning");
      }
    } catch (err) {
      console.error("Lỗi đọc file:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast(`Lỗi đọc file "${file.name}": ${errorMsg}`, "error");
      setText("");
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      showToast("Vui lòng nhập nội dung!", "warning");
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        text: text.trim(),
        pages,
        style,
      };

      const response = await generateArt(payload);

      console.log("API response:", response.data);
      showToast("Generate thành công! Kiểm tra console.", "success");
    } catch (error) {
      console.error("Generate error:", error);
      showToast("Có lỗi khi gọi API.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 6 }}>
      <Toolbar
        pages={pages}
        setPages={setPages}
        style={style}
        setStyle={setStyle}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        onFileSelected={handleFileSelected}
      />

      <Box sx={{ mx: "auto", mt: 4, px: 2 }}>
        <Paper
          elevation={4}
          sx={{ p: 3, borderRadius: 3, position: "relative" }}
        >
          {isLoadingFile && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.4)",
                zIndex: 10,
                borderRadius: 3,
              }}
            >
              <CircularProgress color="secondary" />
            </Box>
          )}

          <TextField
            label={`Nhập cốt truyện (${text.trim() ? text.trim().split(/\s+/).length : 0}/1000 từ)`}
            multiline
            rows={14}
            fullWidth
            variant="outlined"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 5000))}
            placeholder="Nhập cốt truyện..."
            disabled={isLoadingFile}
          />
        </Paper>

        <Box sx={{ mt: 5, textAlign: "center", color: "text.secondary" }}>
          {isGenerating ? (
            <>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3 }}>
                Generating...
              </Typography>
            </>
          ) : (
            <Typography variant="body2">Nhấn Generate để bắt đầu</Typography>
          )}
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
