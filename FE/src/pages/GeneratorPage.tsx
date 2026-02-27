import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  alpha,
} from "@mui/material";
import Toolbar from "../components/layout/ToolBar";
import { generateArt } from "../services/api";
import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import mammoth from "mammoth";
import axios from "axios";
import DownloadIcon from "@mui/icons-material/Download";
import JSZip from "jszip";
import { saveAs } from "file-saver";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface GeneratedImage {
  page: number;
  status: "success" | "error";
  image_base64?: string;
  error?: string;
}

export default function GeneratorPage() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState("dong-ho");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

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
    setText("Reading input file...");

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
    setGeneratedImages([]);

    try {
      const payload = {
        text: text.trim(),
        style,
      };

      const response = await generateArt(payload);
      const data = response.data as { images: GeneratedImage[] };

      if (data.images && Array.isArray(data.images)) {
        const successfulImages = data.images
          .filter(
            (img): img is GeneratedImage & { image_base64: string } =>
              img.status === "success" && typeof img.image_base64 === "string",
          )
          .map((img) => img.image_base64);

        if (successfulImages.length > 0) {
          setGeneratedImages(successfulImages);
          showToast(
            `Đã tạo thành công ${successfulImages.length} ảnh!`,
            "success",
          );
        } else {
          const errorMsgs = data.images
            .filter(
              (img): img is GeneratedImage & { error: string } =>
                img.status === "error" && typeof img.error === "string",
            )
            .map((img) => img.error)
            .join("\n");

          showToast(errorMsgs || "Không tạo được ảnh nào", "error");
        }
      } else {
        showToast("Lỗi khi gọi server", "error");
      }
    } catch (error: unknown) {
      console.error("Generate error:", error);

      let errMsg = "Lỗi không xác định";
      if (error instanceof Error) {
        errMsg = error.message;
      }
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errMsg = error.response.data.message;
      }

      showToast(`Có lỗi khi gọi API: ${errMsg}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAll = async () => {
    if (generatedImages.length === 0) return;

    const zip = new JSZip();

    generatedImages.forEach((base64, index) => {
      const byteString = atob(base64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/png" });
      zip.file(`comic-page-${index + 1}.png`, blob);
    });

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "comic-full.zip");
      showToast(
        `Đã tải xuống comic (${generatedImages.length} trang)`,
        "success",
      );
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi tạo file ZIP", "error");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 6 }}>
      <Toolbar
        style={style}
        setStyle={setStyle}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        onFileSelected={handleFileSelected}
        generatedImages={generatedImages}
        onDownloadAll={handleDownloadAll}
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
            label={`Enter the storyline (${text.trim() ? text.trim().split(/\s+/).length : 0}/1000 words)`}
            multiline
            rows={14}
            fullWidth
            variant="outlined"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 5000))}
            placeholder="Enter the storyline..."
            disabled={isLoadingFile}
          />
        </Paper>

        <Box sx={{ mt: 5, textAlign: "center" }}>
          {isGenerating ? (
            <>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3 }}>
                Generating images...
              </Typography>
            </>
          ) : generatedImages.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                mt: 3,
                width: "100%",
              }}
            >
              {generatedImages.map((base64, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "820px",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    "&:hover .download-btn": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  }}
                >
                  <img
                    src={`data:image/png;base64,${base64}`}
                    alt={`Comic page ${index + 1}`}
                    style={{ width: "100%", display: "block" }}
                  />
                  <IconButton
                    className="download-btn"
                    size="small"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:image/png;base64,${base64}`;
                      link.download = `comic-page-${index + 1}.png`;
                      link.click();
                    }}
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      opacity: 0,
                      transform: "translateY(-8px)",
                      transition: "all 0.2s ease",
                      bgcolor: alpha("#000", 0.5),
                      color: "white",
                      "&:hover": { bgcolor: alpha("#000", 0.75) },
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Press Generate to begin.
            </Typography>
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
