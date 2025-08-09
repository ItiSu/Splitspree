"use client";

import type { ComponentProps, ComponentPropsWithRef } from "react";
import { useId, useRef, useState } from "react";
import { Upload, CheckCircle, X, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { cx } from "class-variance-authority";

/**
 * Returns a human-readable file size.
 * @param bytes - The size of the file in bytes.
 * @returns A string representing the file size in a human-readable format.
 */
export const getReadableFileSize = (bytes: number) => {
    if (bytes === 0) return "0 KB";

    const suffixes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.floor(bytes / Math.pow(1024, i)) + " " + suffixes[i];
};

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    progress: number;
    failed?: boolean;
}

interface FileUploadDropZoneProps {
    /** The class name of the drop zone. */
    className?: string;
    /**
     * A hint text explaining what files can be dropped.
     */
    hint?: string;
    /**
     * Disables dropping or uploading files.
     */
    isDisabled?: boolean;
    /**
     * Specifies the types of files that the server accepts.
     * Examples: "image/*", ".pdf,image/*", "image/*,video/mpeg,application/pdf"
     */
    accept?: string;
    /**
     * Allows multiple file uploads.
     */
    allowsMultiple?: boolean;
    /**
     * Maximum file size in bytes.
     */
    maxSize?: number;
    /**
     * Callback function that is called with the list of dropped files
     * when files are dropped on the drop zone.
     */
    onDropFiles?: (files: FileList) => void;
    /**
     * Callback function that is called with the list of unaccepted files
     * when files are dropped on the drop zone.
     */
    onDropUnacceptedFiles?: (files: FileList) => void;
    /**
     * Callback function that is called with the list of files that exceed
     * the size limit when files are dropped on the drop zone.
     */
    onSizeLimitExceed?: (files: FileList) => void;
}

export const FileUploadDropZone = ({
    className,
    hint,
    isDisabled,
    accept,
    allowsMultiple = true,
    maxSize,
    onDropFiles,
    onDropUnacceptedFiles,
    onSizeLimitExceed,
}: FileUploadDropZoneProps) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const isFileTypeAccepted = (file: File): boolean => {
        if (!accept) return true;

        // Split the accept string into individual types
        const acceptedTypes = accept.split(",").map((type) => type.trim());

        return acceptedTypes.some((acceptedType) => {
            // Handle file extensions (e.g., .pdf, .doc)
            if (acceptedType.startsWith(".")) {
                const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
                return extension === acceptedType.toLowerCase();
            }

            // Handle wildcards (e.g., image/*)
            if (acceptedType.endsWith("/*")) {
                const typePrefix = acceptedType.split("/")[0];
                return file.type.startsWith(`${typePrefix}/`);
            }

            // Handle exact MIME types (e.g., application/pdf)
            return file.type === acceptedType;
        });
    };

    const handleDragIn = (event: React.DragEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragOut = (event: React.DragEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(false);
    };

    const processFiles = (files: File[]): void => {
        // Reset the invalid state when processing files.
        setIsInvalid(false);

        const acceptedFiles: File[] = [];
        const unacceptedFiles: File[] = [];
        const oversizedFiles: File[] = [];

        // If multiple files are not allowed, only process the first file
        const filesToProcess = allowsMultiple ? files : files.slice(0, 1);

        filesToProcess.forEach((file) => {
            // Check file size first
            if (maxSize && file.size > maxSize) {
                oversizedFiles.push(file);
                return;
            }

            // Then check file type
            if (isFileTypeAccepted(file)) {
                acceptedFiles.push(file);
            } else {
                unacceptedFiles.push(file);
            }
        });

        // Handle oversized files
        if (oversizedFiles.length > 0 && typeof onSizeLimitExceed === "function") {
            const dataTransfer = new DataTransfer();
            oversizedFiles.forEach((file) => dataTransfer.items.add(file));

            setIsInvalid(true);
            onSizeLimitExceed(dataTransfer.files);
        }

        // Handle accepted files
        if (acceptedFiles.length > 0 && typeof onDropFiles === "function") {
            const dataTransfer = new DataTransfer();
            acceptedFiles.forEach((file) => dataTransfer.items.add(file));
            onDropFiles(dataTransfer.files);
        }

        // Handle unaccepted files
        if (unacceptedFiles.length > 0 && typeof onDropUnacceptedFiles === "function") {
            const unacceptedDataTransfer = new DataTransfer();
            unacceptedFiles.forEach((file) => unacceptedDataTransfer.items.add(file));

            setIsInvalid(true);
            onDropUnacceptedFiles(unacceptedDataTransfer.files);
        }

        // Clear the input value to ensure the same file can be selected again
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        handleDragOut(event);
        processFiles(Array.from(event.dataTransfer.files));
    };

    const handleInputFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(Array.from(event.target.files || []));
    };

    return (
        <div
            data-dropzone
            onDragOver={handleDragIn}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragEnd={handleDragOut}
            onDrop={handleDrop}
            className={cn(
                "relative flex flex-col items-center gap-4 rounded-xl bg-card/50 backdrop-blur-sm px-6 py-8 text-center border-2 border-dashed border-border/50 transition-all duration-200",
                isDraggingOver && "border-primary/70 bg-primary/5",
                isDisabled && "cursor-not-allowed opacity-50",
                isInvalid && "border-destructive/70 bg-destructive/5",
                className,
            )}
        >
            <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex justify-center items-center gap-1">
                        <input
                            ref={inputRef}
                            id={id}
                            type="file"
                            className="sr-only"
                            disabled={isDisabled}
                            accept={accept}
                            multiple={allowsMultiple}
                            onChange={handleInputFileChange}
                        />
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto font-semibold text-primary"
                            onClick={() => inputRef.current?.click()}
                            disabled={isDisabled}
                        >
                            Click to upload and attach files
                        </Button>
                        <span className="text-sm text-muted-foreground hidden sm:inline">or drag and drop</span>
                    </div>
                    <p className={cn(
                        "text-xs text-muted-foreground transition-colors",
                        isInvalid && "text-destructive"
                    )}>
                        {hint || "SVG, PNG, JPG or GIF (max. 800x400px)"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export interface FileListItemProps {
    /** The name of the file. */
    name: string;
    /** The size of the file. */
    size: number;
    /** The upload progress of the file. */
    progress: number;
    /** Whether the file failed to upload. */
    failed?: boolean;
    /** The class name of the file list item. */
    className?: string;
    /** The function to call when the file is deleted. */
    onDelete?: () => void;
    /** The function to call when the file upload is retried. */
    onRetry?: () => void;
}

export const FileListItemProgressBar = ({ 
    name, 
    size, 
    progress, 
    failed, 
    onDelete, 
    onRetry, 
    className 
}: FileListItemProps) => {
    const isComplete = progress === 100;

    return (
        <motion.li
            layout="position"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
                "relative flex gap-3 rounded-xl bg-card/50 backdrop-blur-sm p-4 border border-border/50 transition-all duration-200",
                failed && "border-destructive/50 bg-destructive/5",
                className,
            )}
        >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                <Upload className="w-5 h-5 text-primary" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex w-full items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{name}</p>

                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{getReadableFileSize(size)}</span>
                            
                            <div className="w-1 h-1 rounded-full bg-border" />
                            
                            <div className="flex items-center gap-1">
                                {isComplete && <CheckCircle className="w-3 h-3 text-green-500" />}
                                {isComplete && <span className="text-green-600 font-medium">Complete</span>}

                                {!isComplete && !failed && <Upload className="w-3 h-3" />}
                                {!isComplete && !failed && <span>Uploading...</span>}

                                {failed && <X className="w-3 h-3 text-destructive" />}
                                {failed && <span className="text-destructive font-medium">Failed</span>}
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={onDelete}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>

                {!failed && (
                    <div className="mt-2">
                        <Progress value={progress} className="h-1" />
                        <div className="flex justify-end mt-1">
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                    </div>
                )}

                {failed && (
                    <div className="mt-2">
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-destructive hover:text-destructive/80"
                            onClick={onRetry}
                        >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Try again
                        </Button>
                    </div>
                )}
            </div>
        </motion.li>
    );
                                        {!isComplete && <UploadCloud02 className="size-4 stroke-[2.5px] text-fg-quaternary" />}

                                        <p className="text-sm text-tertiary">{progress}%</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {failed && (
                        <div className="mt-1.5 flex gap-3">
                            <Button color="link-destructive" size="sm" onClick={onRetry}>
                                Try again
                            </Button>
                        </div>
                    )}
                </div>

                <ButtonUtility color="tertiary" tooltip="Delete" icon={Trash01} size="xs" className="-mt-2 -mr-2 self-start" onClick={onDelete} />
            </div>
        </motion.li>
    );
};

const FileUploadRoot = (props: ComponentPropsWithRef<"div">) => (
    <div {...props} className={cx("flex flex-col gap-4", props.className)}>
        {props.children}
    </div>
);

const FileUploadList = (props: ComponentPropsWithRef<"ul">) => (
    <ul {...props} className={cx("flex flex-col gap-3", props.className)}>
        <AnimatePresence initial={false}>{props.children}</AnimatePresence>
    </ul>
);

export const FileUpload = {
    Root: FileUploadRoot,
    List: FileUploadList,
    DropZone: FileUploadDropZone,
    ListItemProgressBar: FileListItemProgressBar,
    ListItemProgressFill: FileListItemProgressBar,
};
