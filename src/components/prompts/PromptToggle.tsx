import React from "react";
import { Switch } from "@/components/ui/switch";

interface PromptToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const PromptToggle: React.FC<PromptToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
}) => {
  return (
    <Switch
      checked={enabled}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={enabled ? "Disable prompt" : "Enable prompt"}
    />
  );
};

export default PromptToggle;
