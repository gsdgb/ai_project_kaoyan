import { useState, useCallback } from "react";
import { fileApi } from "@/api/endpoints";
import type { UserFile } from "@/types";
import { Card } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatFileSize } from "@/lib/utils";
import {
  Upload,
  FileText,
  File,
  Trash2,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

export default function FilesPage() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error] = useState<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    for (const f of accepted) {
      setUploading(true);
      try {
        const { data } = await fileApi.upload(f);
        setFiles((prev) => [data.data, ...prev]);
        toast.success(`"${f.name}" 上传成功`);
      } catch {
        toast.error(`"${f.name}" 上传失败`);
      } finally {
        setUploading(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: () => toast.error("不支持的文件类型"),
  });

  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">文件管理</h1>
          <p className="text-sm text-neutral-400 mt-1">上传文档用于 RAG 检索</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 mb-6 text-center
          transition-colors cursor-pointer
          ${isDragActive
            ? "border-primary-400 bg-primary-50/50"
            : "border-neutral-300 hover:border-primary-400 hover:bg-neutral-50"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
          <Upload size={22} className="text-primary-500" />
        </div>
        <p className="text-sm font-medium text-neutral-700 mb-1">
          {isDragActive ? "释放以上传文件" : "拖拽文件到此处，或点击上传"}
        </p>
        <p className="text-xs text-neutral-400">
          支持 PDF、Word、TXT 格式，单文件不超过 20MB
        </p>
        {uploading && (
          <div className="mt-4">
            <PageSpinner />
          </div>
        )}
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <Card>
          <EmptyState
            icon={File}
            title="暂无文件"
            description="上传文件后，AI 将能根据文件内容回答问题"
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {files.map((f) => (
            <Card
              key={f.id}
              hover
              className="flex items-center gap-4"
            >
              <div className="h-10 w-10 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center">
                <FileText size={18} className="text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">
                  {f.filename}
                </p>
                <p className="text-xs text-neutral-400">
                  {formatFileSize(f.file_size)} · {formatDate(f.created_at)}
                </p>
              </div>
              <Badge variant="primary" size="sm">
                {f.file_type}
              </Badge>
              <button
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-neutral-400 hover:text-danger-500 hover:bg-danger-50 transition-colors cursor-pointer"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
