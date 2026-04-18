"use client";

import { BaseModal } from "./BaseModal";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      footer={null}
    >
      <div className="p-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Item Being Deleted */}
        {itemName && (
          <div className="mb-6 p-3.5 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Item to be deleted:</p>
            <p className="text-sm font-semibold text-red-700">{itemName}</p>
          </div>
        )}

        {/* Warning Text */}
        <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xs text-amber-800">
            <span className="font-semibold">This action cannot be undone.</span> All associated data will be permanently removed from the system.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-red-200 border-t-white animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
