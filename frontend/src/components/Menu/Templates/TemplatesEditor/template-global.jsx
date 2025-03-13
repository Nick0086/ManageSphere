import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTemplate } from '@/contexts/TemplateContext';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { templateDefaultValue } from '../utils';

const ColorPicker = ({
  label,
  currentColor,
  onColorChange,
  colorKey,
  updateTemplateConfig
}) => {
  const defaultColors = templateDefaultValue.global;

  const handleChange = (value) => {
    onColorChange(value);
    updateTemplateConfig((prevConfig) => ({
      ...prevConfig,
      global: {
        ...prevConfig.global,
        [colorKey]: value
      }
    }));
  };

  const handleInputChange = (e) => {
    handleChange(e.target.value);
  };

  const handleReset = () => {
    handleChange(defaultColors[colorKey]);
  };

  return (
    <div>
      <Label className="text-xs font-medium block mb-1.5">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className="w-8 h-8 rounded-md border border-gray-300 overflow-hidden"
            style={{ backgroundColor: currentColor }}
          >
            <input
              type="color"
              value={currentColor}
              onChange={handleInputChange}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
        </div>
        <Input
          value={currentColor}
          onChange={handleInputChange}
          className="font-mono text-sm"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                onClick={handleReset}
                size="xs"
                type="button"
                variant="ghost"
                className="rounded-full text-green-500 hover:bg-green-100 hover:text-green-600"
              >
                <RotateCcw size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Reset
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

const ResetButton = ({ onClick, tooltipText }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Button
          onClick={onClick}
          size="xs"
          type="button"
          variant="ghost"
          className="rounded-full text-green-500 hover:bg-green-100 hover:text-green-600"
        >
          <RotateCcw size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const TemplateGlobal = ({ templateConfig, setTemplateConfig }) => {
  const {
    backgroundColor,
    setBackgroundColor,
    sectionBackgroundColor,
    setSectionBackgroundColor,
    titleColor,
    setTitleColor,
    descriptionColor,
    setDescriptionColor,
    cardTitleColor,
    setCardTitleColor,
    cardBackgroundColor,
    setCardBackgroundColor,
    buttonBackgroundColor,
    setButtonBackgroundColor,
    buttonLabelColor,
    setButtonLabelColor,
    resetAllHandler
  } = useTemplate();

  // Color config mapping for cleaner rendering
  const colorConfigs = [
    {
      label: "Background Color",
      currentColor: backgroundColor,
      onColorChange: setBackgroundColor,
      colorKey: "background_color"
    },
    {
      label: "Section Background Color",
      currentColor: sectionBackgroundColor,
      onColorChange: setSectionBackgroundColor,
      colorKey: "section_background_color"
    },
    {
      label: "Title Color",
      currentColor: titleColor,
      onColorChange: setTitleColor,
      colorKey: "title_color"
    },
    {
      label: "Card Title Color",
      currentColor: cardTitleColor,
      onColorChange: setCardTitleColor,
      colorKey: "card_title_color"
    },
    {
      label: "Card Background Color",
      currentColor: cardBackgroundColor,
      onColorChange: setCardBackgroundColor,
      colorKey: "card_background_color"
    },
    {
      label: "Description Color",
      currentColor: descriptionColor,
      onColorChange: setDescriptionColor,
      colorKey: "description_color"
    }
  ];

  const buttonColorConfigs = [
    {
      label: "Label Color",
      currentColor: buttonLabelColor,
      onColorChange: setButtonLabelColor,
      colorKey: "button_label_color"
    },
    {
      label: "Background Color",
      currentColor: buttonBackgroundColor,
      onColorChange: setButtonBackgroundColor,
      colorKey: "button_background_color"
    }
  ];

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between">
          <h5 className="text-lg font-medium px-4 pb-2">Background & Colors</h5>
          <ResetButton onClick={resetAllHandler} tooltipText="Reset All" />
        </div>

        <div className="space-y-4 px-4 pb-2">
          {colorConfigs.map((config) => (
            <ColorPicker
              key={config.colorKey}
              label={config.label}
              currentColor={config.currentColor}
              onColorChange={config.onColorChange}
              colorKey={config.colorKey}
              updateTemplateConfig={setTemplateConfig}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h5 className="text-lg font-medium px-4 pb-2">Button Colors</h5>
        <div className="space-y-4 px-4 pb-2">
          {buttonColorConfigs.map((config) => (
            <ColorPicker
              key={config.colorKey}
              label={config.label}
              currentColor={config.currentColor}
              onColorChange={config.onColorChange}
              colorKey={config.colorKey}
              updateTemplateConfig={setTemplateConfig}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateGlobal;