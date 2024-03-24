import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import type { PropsWithChildren } from "react";
import React from "react";

export function NoteDirective({
  children,
  text,
}: PropsWithChildren<{ text: string }>) {
  return (
    <div className="border-l-4 border-blue-400 bg-blue-50 p-4 my-4">
      <div className="flex m-0 p-0 ">
        <div className="flex-shrink-0 m-0 p-0 ">
          <InformationCircleIcon
            className="h-5 w-5 text-blue-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <div className="ml-3">
            <div className="text-sm font-medium text-blue-800">Note</div>
            <div className="mt-2 text-sm text-blue-700">{text}</div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WarnDirective({
  children,
  text,
}: PropsWithChildren<{ text: string }>) {
  return (
    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 my-4">
      <div className="flex m-0 p-0 ">
        <div className="flex-shrink-0 m-0 p-0 ">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <div className="ml-3">
            <div className="text-sm font-medium text-yellow-800">Warning</div>
            <div className="mt-2 text-sm text-yellow-700">{text}</div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
