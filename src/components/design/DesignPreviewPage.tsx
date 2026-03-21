import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  LayoutTemplate,
  Layers3,
  Palette,
  Pencil,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash,
} from "lucide-react";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SharedAppEntityCard } from "@/components/common/SharedAppEntityCard";
import { AppToggleGroup } from "@/components/common/AppToggleGroup";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AppId } from "@/lib/api";
import { MCP_SKILLS_APP_IDS } from "@/config/appConfig";
import { cn } from "@/lib/utils";
import type { Provider } from "@/types";

type DialogVariantKey = "default" | "form" | "confirm" | "wizard" | "fullscreen";
type ComponentDocKey =
  | "buttons"
  | "input"
  | "select"
  | "switches"
  | "dialog"
  | "menu"
  | "tooltip"
  | "tabs"
  | "segmented"
  | "feedback";

type DemoFormValues = {
  name: string;
  endpoint: string;
  protocol: string;
  notes: string;
};

type InventoryRow = {
  component: string;
  names: string;
  sizes: string;
  states: string;
  source: string;
};

type ProviderShowcaseItem = {
  key: string;
  title: string;
  description: string;
  appId: AppId;
  provider: Provider;
  isCurrent?: boolean;
  isInConfig?: boolean;
  isOmo?: boolean;
  isOmoSlim?: boolean;
  isAutoFailoverEnabled?: boolean;
  isInFailoverQueue?: boolean;
  failoverPriority?: number;
  isDefaultModel?: boolean;
};

type SharedCardShowcaseItem = {
  key: string;
  title: string;
  description: string;
  cardTitle: string;
  cardDescription: string;
  cardDescriptionTitle?: string;
  apps: Record<AppId, boolean>;
  hasExternalLink?: boolean;
  footerActions?: React.ReactNode;
};

type ComponentDocGroup = {
  title: string;
  items: Array<{
    key: ComponentDocKey;
    label: string;
    note: string;
  }>;
};

type ColorTokenRow = {
  name: string;
  lightValue: string;
  darkValue: string;
  usage: string;
  lightPreviewClassName: string;
  darkPreviewClassName: string;
  source?: string;
};

const buttonVariantRows: InventoryRow[] = [
  {
    component: "Button",
    names: "default, outline, secondary, ghost, destructive, link",
    sizes: "default 36px, sm 32px, lg 40px, icon 36x36",
    states: "hover, focus-visible, disabled",
    source: "src/components/ui/button.tsx",
  },
];

const formRows: InventoryRow[] = [
  {
    component: "Input",
    names: "base",
    sizes: "36px 高, 10px 圆角",
    states: "default, focus, disabled",
    source: "src/components/ui/input.tsx",
  },
  {
    component: "Select",
    names: "trigger, content, item",
    sizes: "trigger 36px 高, popover 列表自适应",
    states: "open, focus, disabled, item selected",
    source: "src/components/ui/select.tsx",
  },
  {
    component: "Textarea",
    names: "base",
    sizes: "min-height 80px",
    states: "default, focus, disabled",
    source: "src/components/ui/textarea.tsx",
  },
  {
    component: "Switch",
    names: "default, sm",
    sizes: "24x44, 20x36",
    states: "checked, unchecked, disabled",
    source: "src/components/ui/switch.tsx",
  },
  {
    component: "Checkbox",
    names: "base",
    sizes: "16x16",
    states: "checked, unchecked, disabled",
    source: "src/components/ui/checkbox.tsx",
  },
];

const overlayRows: InventoryRow[] = [
  {
    component: "DialogContent",
    names: "default, form, confirm, wizard, fullscreen",
    sizes: "max-w-md ~ max-w-4xl / fullscreen",
    states: "open, close, overlay blur",
    source: "src/components/ui/dialog.tsx",
  },
  {
    component: "Popover",
    names: "content",
    sizes: "自适应内容宽度",
    states: "open, close",
    source: "src/components/ui/popover.tsx",
  },
  {
    component: "DropdownMenu",
    names: "item, checkbox item, radio item, sub menu",
    sizes: "min-width 8rem",
    states: "open, focus, checked, selected",
    source: "src/components/ui/dropdown-menu.tsx",
  },
  {
    component: "Tooltip",
    names: "content",
    sizes: "紧凑提示气泡",
    states: "hover open, focus open",
    source: "src/components/ui/tooltip.tsx",
  },
  {
    component: "Command",
    names: "input, list, group, item",
    sizes: "列表最高 300px",
    states: "selected, empty, keyboard navigation",
    source: "src/components/ui/command.tsx",
  },
];

const navigationRows: InventoryRow[] = [
  {
    component: "TabsTrigger",
    names: "default, underline, line",
    sizes: "默认 120px 最小宽度 / line 自适应",
    states: "active, inactive, hover",
    source: "src/components/ui/tabs.tsx",
  },
  {
    component: "SegmentedControl",
    names: "container, item",
    sizes: "sm button 规格",
    states: "active, inactive, hover",
    source: "src/components/ui/segmented-control.tsx",
  },
  {
    component: "Badge",
    names: "default, secondary, outline, destructive",
    sizes: "胶囊标签",
    states: "default, hover",
    source: "src/components/ui/badge.tsx",
  },
  {
    component: "Alert",
    names: "default, destructive",
    sizes: "块级提示条",
    states: "default",
    source: "src/components/ui/alert.tsx",
  },
];

const componentDocGroups: ComponentDocGroup[] = [
  {
    title: "通用",
    items: [
      { key: "buttons", label: "Button", note: "变体 / 尺寸 / 状态" },
      { key: "input", label: "Input", note: "输入框 / Textarea" },
      { key: "select", label: "Select", note: "触发器 / 列表 / 选中" },
    ],
  },
  {
    title: "选择与导航",
    items: [
      { key: "switches", label: "Switch", note: "Switch / Checkbox" },
      { key: "tabs", label: "Tabs", note: "default / line" },
      { key: "segmented", label: "Segmented", note: "容器 / item / hover" },
    ],
  },
  {
    title: "浮层与反馈",
    items: [
      { key: "dialog", label: "Dialog", note: "default / form / wizard" },
      { key: "menu", label: "Menu", note: "Dropdown / Popover / Command" },
      { key: "tooltip", label: "Tooltip", note: "Tooltip / Toast" },
      { key: "feedback", label: "Feedback", note: "Badge / Alert" },
    ],
  },
];

const surfaceTokenRows: ColorTokenRow[] = [
  {
    name: "--background",
    lightValue: "0 0% 98%",
    darkValue: "240 10% 8%",
    usage: "页面主背景，应用内容区的大面积底色。",
    lightPreviewClassName: "bg-background",
    darkPreviewClassName: "bg-[hsl(240_10%_8%)]",
  },
  {
    name: "--card",
    lightValue: "0 0% 100%",
    darkValue: "240 9% 11%",
    usage: "卡片、面板、局部模块容器底色。",
    lightPreviewClassName: "bg-card",
    darkPreviewClassName: "bg-[hsl(240_9%_11%)]",
  },
  {
    name: "--popover",
    lightValue: "0 0% 100%",
    darkValue: "240 9% 11%",
    usage: "Popover、菜单、下拉层这类浮层表面。",
    lightPreviewClassName: "bg-popover",
    darkPreviewClassName: "bg-[hsl(240_9%_11%)]",
  },
  {
    name: "--muted",
    lightValue: "240 10% 95%",
    darkValue: "240 7% 14%",
    usage: "弱化容器、次要底色、分段控制容器底。",
    lightPreviewClassName: "bg-muted",
    darkPreviewClassName: "bg-[hsl(240_7%_14%)]",
  },
  {
    name: "--primary",
    lightValue: "222 89% 58%",
    darkValue: "221 83% 65%",
    usage: "主按钮、选中态、主题强调和 focus ring 语义色。",
    lightPreviewClassName: "bg-primary",
    darkPreviewClassName: "bg-[hsl(221_83%_65%)]",
  },
  {
    name: "--destructive",
    lightValue: "0 72% 56%",
    darkValue: "0 70% 45%",
    usage: "危险操作、错误态强调、destructive 组件语义色。",
    lightPreviewClassName: "bg-destructive",
    darkPreviewClassName: "bg-[hsl(0_70%_45%)]",
  },
];

const textTokenRows: ColorTokenRow[] = [
  {
    name: "--foreground",
    lightValue: "240 10% 8%",
    darkValue: "0 0% 98%",
    usage: "主文本、标题、核心信息、主要图标。",
    lightPreviewClassName: "bg-foreground",
    darkPreviewClassName: "bg-[hsl(0_0%_98%)]",
  },
  {
    name: "--muted-foreground",
    lightValue: "240 5% 43%",
    darkValue: "240 6% 65%",
    usage: "次级说明、描述文字、弱化信息和辅助标签。",
    lightPreviewClassName: "bg-muted-foreground",
    darkPreviewClassName: "bg-[hsl(240_6%_65%)]",
  },
  {
    name: "--primary-foreground",
    lightValue: "0 0% 100%",
    darkValue: "240 10% 8%",
    usage: "放在主题色背景上的文字和图标颜色。",
    lightPreviewClassName: "bg-primary-foreground border",
    darkPreviewClassName: "bg-[hsl(240_10%_8%)]",
  },
  {
    name: "--destructive-foreground",
    lightValue: "0 0% 98%",
    darkValue: "0 0% 98%",
    usage: "放在 destructive 背景上的文字和图标颜色。",
    lightPreviewClassName: "bg-destructive-foreground border",
    darkPreviewClassName: "bg-[hsl(0_0%_98%)] border",
  },
];

const feedbackTokenRows: ColorTokenRow[] = [
  {
    name: "success",
    lightValue: "emerald-700",
    darkValue: "emerald-400",
    usage: "成功 toast、健康状态、运行正常、启用成功等反馈。",
    lightPreviewClassName: "bg-emerald-600",
    darkPreviewClassName: "bg-emerald-400",
    source: "ui/sonner.tsx · providers/HealthStatusIndicator.tsx",
  },
  {
    name: "warning",
    lightValue: "amber-700",
    darkValue: "amber-400",
    usage: "风险提示、注意事项、兼容性提醒、需人工确认的信息。",
    lightPreviewClassName: "bg-amber-500",
    darkPreviewClassName: "bg-amber-400",
    source: "providers/forms/shared/EndpointField.tsx · openclaw/OpenClawHealthBanner.tsx",
  },
  {
    name: "info",
    lightValue: "sky-700",
    darkValue: "sky-400",
    usage: "中性说明、过程提示、普通信息反馈。",
    lightPreviewClassName: "bg-sky-500",
    darkPreviewClassName: "bg-sky-400",
    source: "providers/forms/GeminiFormFields.tsx · deeplink/SkillConfirmation.tsx",
  },
  {
    name: "error",
    lightValue: "red-700",
    darkValue: "red-400",
    usage: "失败消息、错误 toast、不可继续的异常状态。",
    lightPreviewClassName: "bg-red-500",
    darkPreviewClassName: "bg-red-400",
    source: "settings/ImportExportSection.tsx · usage/RequestDetailPanel.tsx",
  },
];

const implementationColorRows: ColorTokenRow[] = [
  {
    name: "info-panel / blue",
    lightValue: "bg-blue-50 · border-blue-200 · text-blue-700",
    darkValue: "bg-blue-950/30 · border-blue-800 · text-blue-300",
    usage: "说明块、帮助提示、导入确认、Gemini 附加说明等蓝色信息面板。",
    lightPreviewClassName: "bg-blue-50",
    darkPreviewClassName: "bg-blue-950/30",
    source: "providers/forms/GeminiFormFields.tsx · providers/forms/shared/ApiKeySection.tsx · deeplink/SkillConfirmation.tsx",
  },
  {
    name: "warning-banner / yellow",
    lightValue: "bg-yellow-50 · border-yellow-200 · text-yellow-800",
    darkValue: "bg-yellow-950 · border-yellow-900 · text-yellow-200",
    usage: "顶部环境警告、导入前提醒、需要用户立即留意的黄色横幅。",
    lightPreviewClassName: "bg-yellow-50",
    darkPreviewClassName: "bg-yellow-950",
    source: "env/EnvWarningBanner.tsx · DeepLinkImportDialog.tsx",
  },
  {
    name: "hint-panel / amber",
    lightValue: "bg-amber-50 · border-amber-200 · text-amber-600",
    darkValue: "bg-amber-900/20 · border-amber-700 · text-amber-400",
    usage: "Endpoint hint、OpenClaw 提示、代理说明等偏中性风险提醒。",
    lightPreviewClassName: "bg-amber-50",
    darkPreviewClassName: "bg-amber-900/20",
    source: "providers/forms/shared/EndpointField.tsx · openclaw/OpenClawHealthBanner.tsx · openclaw/ToolsPanel.tsx",
  },
  {
    name: "success-chip / soft green",
    lightValue: "bg-emerald-500/10 · text-emerald-600",
    darkValue: "bg-emerald-900/40 · text-emerald-300",
    usage: "健康徽标、启用状态、小型成功标签和卡片角标。",
    lightPreviewClassName: "bg-emerald-500/10",
    darkPreviewClassName: "bg-emerald-900/40",
    source: "providers/ProviderHealthBadge.tsx · providers/ProviderCard.tsx · prompts/PromptListItem.tsx",
  },
  {
    name: "error-panel / soft red",
    lightValue: "bg-red-50 · border-red-300/70 · text-red-900",
    darkValue: "bg-red-950/30 · border-red-500/50 · text-red-200",
    usage: "错误提示块、同步失败、导入失败、请求异常详情。",
    lightPreviewClassName: "bg-red-50",
    darkPreviewClassName: "bg-red-950/30",
    source: "settings/WebdavSyncSection.tsx · settings/ImportExportSection.tsx · usage/RequestDetailPanel.tsx",
  },
  {
    name: "selection / action blue",
    lightValue: "bg-blue-500 · text-white",
    darkValue: "bg-blue-600 · text-white",
    usage: "选中供应商、上传按钮、导入按钮和部分主操作仍在直接用蓝色实现。",
    lightPreviewClassName: "bg-blue-500",
    darkPreviewClassName: "bg-blue-600",
    source: "providers/forms/ProviderPresetSelector.tsx · settings/ImportExportSection.tsx · providers/ProviderActions.tsx",
  },
  {
    name: "health-dot set",
    lightValue: "emerald-500 · yellow-500 · red-500",
    darkValue: "emerald-400 · yellow-400 · red-400",
    usage: "健康状态点、测速结果状态、在线/告警/失败小圆点。",
    lightPreviewClassName: "bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500",
    darkPreviewClassName: "bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400",
    source: "providers/HealthStatusIndicator.tsx · providers/forms/EndpointSpeedTest.tsx",
  },
];

const interactionStateRows: ColorTokenRow[] = [
  {
    name: "segmented / tabs inactive hover",
    lightValue: "black/5",
    darkValue: "white/5",
    usage: "Segmented Control 和 default Tabs 未选中项的悬停底色。",
    lightPreviewClassName: "bg-black/5",
    darkPreviewClassName: "bg-white/5",
    source: "ui/segmented-control.tsx · ui/tabs.tsx",
  },
  {
    name: "segmented / tabs active surface",
    lightValue: "bg-card + text-foreground/80 on hover",
    darkValue: "bg-card + text-foreground/80 on hover",
    usage: "已选中项保持 bg-card，不改背景，只在 hover 时让文字稍微变浅。",
    lightPreviewClassName: "bg-card",
    darkPreviewClassName: "bg-[hsl(240_9%_11%)]",
    source: "ui/segmented-control.tsx · ui/tabs.tsx",
  },
  {
    name: "form hover border",
    lightValue: "black/15",
    darkValue: "white/15",
    usage: "Input / Select / Textarea 在 hover 时的中性边框加深色。",
    lightPreviewClassName: "bg-black/15",
    darkPreviewClassName: "bg-white/15",
    source: "ui/input.tsx · ui/select.tsx · ui/textarea.tsx",
  },
  {
    name: "focus ring",
    lightValue: "ring / 30%",
    darkValue: "ring / 30%",
    usage: "按钮、Tabs 等交互组件的 focus-visible ring 透明度。",
    lightPreviewClassName: "bg-primary/30",
    darkPreviewClassName: "bg-[hsl(221_83%_65%_/_0.3)]",
    source: "ui/button.tsx · ui/tabs.tsx",
  },
  {
    name: "tooltip surface",
    lightValue: "black / 85%",
    darkValue: "black / 85%",
    usage: "Tooltip 统一使用的中性黑底，不跟随主题色。",
    lightPreviewClassName: "bg-black/[0.85]",
    darkPreviewClassName: "bg-black/[0.85]",
    source: "ui/tooltip.tsx",
  },
  {
    name: "toast success text",
    lightValue: "emerald-600",
    darkValue: "emerald-400",
    usage: "顶部成功 toast 的标题与描述文字颜色。",
    lightPreviewClassName: "bg-emerald-600",
    darkPreviewClassName: "bg-emerald-400",
    source: "ui/sonner.tsx · index.css",
  },
  {
    name: "disabled opacity",
    lightValue: "opacity-50",
    darkValue: "opacity-50",
    usage: "按钮、输入框、选择器、开关、复选框等禁用态统一通过透明度减弱表现。",
    lightPreviewClassName: "bg-muted/50",
    darkPreviewClassName: "bg-white/10",
    source: "ui/button.tsx · ui/input.tsx · ui/select.tsx · ui/textarea.tsx · ui/switch.tsx · ui/checkbox.tsx",
  },
  {
    name: "selected border / underline",
    lightValue: "foreground / 80%",
    darkValue: "foreground / 80%",
    usage: "underline / line Tabs 的选中边线与下划线颜色，和主文本前景保持一致但稍微收轻。",
    lightPreviewClassName: "bg-foreground/80",
    darkPreviewClassName: "bg-[hsl(0_0%_98%_/_0.8)]",
    source: "ui/tabs.tsx",
  },
  {
    name: "pressed state",
    lightValue: "未单独定义",
    darkValue: "未单独定义",
    usage: "当前基础组件没有统一的 pressed 专色，大多数控件继续沿用 hover / 当前表面或浏览器原生按压反馈。",
    lightPreviewClassName: "bg-transparent",
    darkPreviewClassName: "bg-transparent",
    source: "ui/button.tsx · ui/segmented-control.tsx · ui/tabs.tsx",
  },
];

const providerShowcases: ProviderShowcaseItem[] = [
  {
    key: "active-claude",
    title: "当前启用卡片",
    description: "蓝色边框 + 当前启用态。",
    appId: "claude",
    isCurrent: true,
    provider: {
      id: "",
      name: "Claude Pro Proxy",
      settingsConfig: {},
      websiteUrl: "https://api.claude.example/v1",
      category: "official",
      iconColor: "#5B6CFF",
    },
  },
  {
    key: "partner-card",
    title: "合作伙伴卡片",
    description: "第三方卡片和常规未启用态。",
    appId: "claude",
    provider: {
      id: "",
      name: "PackyCode",
      settingsConfig: {},
      websiteUrl: "https://packycode.example/openai",
      category: "third_party",
      meta: { isPartner: true },
      iconColor: "#F59E0B",
    },
  },
  {
    key: "failover-card",
    title: "故障转移队列",
    description: "展示 failover 优先级标签。",
    appId: "claude",
    isAutoFailoverEnabled: true,
    isInFailoverQueue: true,
    failoverPriority: 2,
    provider: {
      id: "",
      name: "Fallback Gateway",
      settingsConfig: {},
      websiteUrl: "https://fallback.example/anthropic",
      category: "aggregator",
      iconColor: "#10B981",
    },
  },
  {
    key: "omo-card",
    title: "OMO 风格",
    description: "特殊供应商标签 + 启用态。",
    appId: "opencode",
    isCurrent: true,
    isOmo: true,
    provider: {
      id: "",
      name: "Oh My OpenCode",
      settingsConfig: {},
      websiteUrl: "https://omo.example",
      category: "omo",
      iconColor: "#8B5CF6",
    },
  },
];

const sharedCardShowcases: SharedCardShowcaseItem[] = [
  {
    key: "complete",
    title: "完整态",
    description: "标题、描述、外链、toggle 和双操作按钮都齐全。",
    cardTitle: "Context7",
    cardDescription: "最新文档搜索与代码示例检索，适合作为标准共享卡片展示。",
    cardDescriptionTitle:
      "最新文档搜索与代码示例检索，适合作为标准共享卡片展示。",
    apps: {
      claude: true,
      codex: true,
      gemini: false,
      opencode: true,
      openclaw: false,
    },
    hasExternalLink: true,
    footerActions: (
      <>
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-[8px]">
          <Pencil size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-[8px] hover:text-red-500 hover:bg-red-100 dark:hover:text-red-400 dark:hover:bg-red-500/10"
        >
          <Trash size={14} />
        </Button>
      </>
    ),
  },
  {
    key: "fallback",
    title: "fallback 描述态",
    description: "无真实描述时仍保留相同描述区高度，验证文案占位。",
    cardTitle: "滴答清单",
    cardDescription: "didatask/ticktick-mcp",
    cardDescriptionTitle: "didatask/ticktick-mcp",
    apps: {
      claude: true,
      codex: false,
      gemini: true,
      opencode: false,
      openclaw: false,
    },
    hasExternalLink: true,
    footerActions: (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-[8px] hover:text-red-500 hover:bg-red-100 dark:hover:text-red-400 dark:hover:bg-red-500/10"
      >
        <Trash size={14} />
      </Button>
    ),
  },
  {
    key: "minimal",
    title: "精简态",
    description: "无外链且无右侧操作，只保留标题、描述与 app 切换。",
    cardTitle: "Local Skill Pack",
    cardDescription: "本地技能集合，验证稀疏布局下 header 与 footer 的平衡。",
    cardDescriptionTitle: "本地技能集合，验证稀疏布局下 header 与 footer 的平衡。",
    apps: {
      claude: false,
      codex: true,
      gemini: false,
      opencode: false,
      openclaw: false,
    },
  },
];

const noop = () => {};

export default function DesignPreviewPage() {
  const [topTab, setTopTab] = useState("components");
  const [componentTab, setComponentTab] = useState<ComponentDocKey>("buttons");
  const [lineTabs, setLineTabs] = useState("preview");
  const [formSelectValue, setFormSelectValue] = useState("anthropic");
  const [previewSelectValue, setPreviewSelectValue] = useState("anthropic");
  const [dialogVariant, setDialogVariant] = useState<DialogVariantKey | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [compactSwitch, setCompactSwitch] = useState(true);
  const [defaultSwitch, setDefaultSwitch] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [segmentedValue, setSegmentedValue] = useState("preview");
  const [dropdownBookmarks, setDropdownBookmarks] = useState(true);
  const [dropdownView, setDropdownView] = useState("comfortable");

  const form = useForm<DemoFormValues>({
    defaultValues: {
      name: "Claude API",
      endpoint: "https://api.example.com/v1",
      protocol: "anthropic",
      notes: "这里用真实项目里的基础组件拼了一组表单，用来观察尺寸、间距、边框、focus ring 和按钮组合。",
    },
  });

  const summaryItems = useMemo(
    () => [
      { label: "基础组件", value: "16+", note: "已接入预览的基础 UI" },
      { label: "按钮变体", value: "7", note: "default 到 link" },
      { label: "按钮尺寸", value: "4", note: "default / sm / lg / icon" },
      { label: "弹窗变体", value: "5", note: "default / form / confirm / wizard / fullscreen" },
    ],
    [],
  );

  const renderComponentDoc = () => {
    switch (componentTab) {
      case "buttons":
        return (
          <DocPage
            title="Button"
            description="用一个页面讲清按钮的语法糖、尺寸、状态和真实 hover / disabled 表现。"
            source="src/components/ui/button.tsx"
            chips={["variant", "size", "hover", "disabled"]}
          >
            <DocCard
              title="语法糖 / 变体"
              description="当前项目里真实存在的按钮变体。建议主操作优先用 default，其它按语义分层。"
            >
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link button</Button>
              </div>
            </DocCard>

            <div className="grid gap-4 xl:grid-cols-2">
              <DocCard title="尺寸" description="高度分别对应 32 / 36 / 40px，以及 36x36 的 icon。">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button>Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon" aria-label="icon action">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </DocCard>

              <DocCard title="状态" description="直接在页面里试 hover、focus 和 disabled。">
                <div className="flex flex-wrap items-center gap-3">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button variant="outline" disabled>
                    Disabled outline
                  </Button>
                  <Button variant="ghost">Ghost hover</Button>
                </div>
              </DocCard>
            </div>

            <SpecGrid
              items={[
                { label: "变体", value: "default / outline / secondary / ghost / destructive / link" },
                { label: "尺寸", value: "sm / default / lg / icon" },
                { label: "交互", value: "hover / focus-visible / disabled" },
                { label: "适用", value: "主操作、次操作、危险操作、纯文字链接" },
              ]}
            />
          </DocPage>
        );
      case "input":
        return (
          <DocPage
            title="Input"
            description="输入类组件要看尺寸、边框、hover / focus，以及说明文案和多行场景。"
            source="src/components/ui/input.tsx · src/components/ui/textarea.tsx"
            chips={["input", "textarea", "focus", "hover"]}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <DocCard title="单行输入" description="当前基础输入框高度 36px，圆角 10px。">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="doc-input-default">Default</Label>
                    <Input id="doc-input-default" placeholder="请输入内容" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-input-disabled">Disabled</Label>
                    <Input id="doc-input-disabled" value="Disabled state" disabled readOnly />
                  </div>
                </div>
              </DocCard>

              <DocCard title="多行输入" description="用于说明、备注和长段文本输入。">
                <div className="space-y-2">
                  <Label htmlFor="doc-textarea">Textarea</Label>
                  <Textarea
                    id="doc-textarea"
                    rows={4}
                    defaultValue="在这里观察边框、hover、focus 和多行文本密度。"
                  />
                </div>
              </DocCard>
            </div>

            <DocCard title="表单组合" description="放进真实表单里看标签、说明文案和底部按钮关系。">
              <Form {...form}>
                <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider name</FormLabel>
                        <FormControl>
                          <Input placeholder="输入供应商名称" {...field} />
                        </FormControl>
                        <FormDescription>适合看 label / input / description 的竖向节奏。</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormDescription>用于观察多行输入和长文案场景。</FormDescription>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </DocCard>

            <SpecGrid
              items={[
                { label: "Input", value: "36px 高 / 10px 圆角" },
                { label: "Textarea", value: "min-height 80px" },
                { label: "交互", value: "neutral hover 边框 / focus ring / disabled" },
                { label: "适用", value: "配置项、API 地址、备注说明" },
              ]}
            />
          </DocPage>
        );
      case "select":
        return (
          <DocPage
            title="Select"
            description="选择器要重点看 trigger、列表弹层、选中态和 hover 的统一程度。"
            source="src/components/ui/select.tsx"
            chips={["trigger", "content", "item", "open"]}
          >
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <DocCard title="Trigger" description="当前触发器高度 36px，hover 用中性色加深，鼠标为手型。">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="doc-select-default">API format</Label>
                    <Select value={previewSelectValue} onValueChange={setPreviewSelectValue}>
                      <SelectTrigger id="doc-select-default">
                        <SelectValue placeholder="选择供应商" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="openai">OpenAI Compatible</SelectItem>
                        <SelectItem value="gemini">Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-muted-foreground">当前选中值：{previewSelectValue}</div>
                </div>
              </DocCard>

              <DocCard title="放进表单" description="在真实表单里看 label、description 和弹层是否协调。">
                <Form {...form}>
                  <form onSubmit={(event) => event.preventDefault()}>
                    <FormField
                      control={form.control}
                      name="protocol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API format</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setFormSelectValue(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择协议" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="anthropic">Anthropic</SelectItem>
                              <SelectItem value="openai_chat">OpenAI Chat</SelectItem>
                              <SelectItem value="openai_responses">OpenAI Responses</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>当前选中值：{formSelectValue}</FormDescription>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </DocCard>
            </div>

            <SpecGrid
              items={[
                { label: "组成", value: "trigger / content / item" },
                { label: "尺寸", value: "trigger 36px 高，内容宽度自适应" },
                { label: "交互", value: "open / selected / hover / disabled" },
                { label: "适用", value: "协议、模型格式、枚举类配置项" },
              ]}
            />
          </DocPage>
        );
      case "switches":
        return (
          <DocPage
            title="Switch & Checkbox"
            description="布尔开关和单项勾选更适合在一个页面里一起看，因为它们都属于状态型控件。"
            source="src/components/ui/switch.tsx · src/components/ui/checkbox.tsx"
            chips={["switch", "checkbox", "default", "sm"]}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <DocCard title="Switch" description="当前默认开关带玻璃感，支持 default 和 sm 两种尺寸。">
                <div className="grid gap-3 rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Default switch</span>
                    <Switch checked={defaultSwitch} onCheckedChange={setDefaultSwitch} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compact switch</span>
                    <Switch size="sm" checked={compactSwitch} onCheckedChange={setCompactSwitch} />
                  </div>
                </div>
              </DocCard>

              <DocCard title="Checkbox" description="更适合列表勾选、许可确认或轻量布尔状态。">
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 p-4">
                  <Checkbox
                    id="doc-checkbox"
                    checked={checkboxChecked}
                    onCheckedChange={(checked) => setCheckboxChecked(Boolean(checked))}
                  />
                  <Label htmlFor="doc-checkbox">Checkbox selected state</Label>
                </div>
              </DocCard>
            </div>

            <SpecGrid
              items={[
                { label: "Switch 尺寸", value: "24x44 / 20x36" },
                { label: "Checkbox 尺寸", value: "16x16" },
                { label: "交互", value: "checked / unchecked / disabled" },
                { label: "适用", value: "设置项、配置页布尔开关、勾选列表" },
              ]}
            />
          </DocPage>
        );
      case "dialog":
        return (
          <DocPage
            title="Dialog"
            description="弹窗页需要直接区分变体、尺寸、离窗口边距和页头页脚结构。"
            source="src/components/ui/dialog.tsx"
            chips={["default", "form", "confirm", "wizard", "fullscreen"]}
          >
            <DocCard title="变体入口" description="打开对应弹窗，直接观察边距、边框、阴影和内容布局。">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setDialogVariant("default")}>Default</Button>
                <Button variant="outline" onClick={() => setDialogVariant("form")}>
                  Form
                </Button>
                <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                  Confirm
                </Button>
                <Button variant="ghost" onClick={() => setDialogVariant("wizard")}>
                  Wizard
                </Button>
                <Button variant="outline" onClick={() => setDialogVariant("fullscreen")}>
                  Fullscreen
                </Button>
              </div>
            </DocCard>

            <SpecGrid
              items={[
                { label: "变体", value: "default / form / confirm / wizard / fullscreen" },
                { label: "边距", value: "窗口四周 48px 安全边距（非 fullscreen）" },
                { label: "边框", value: "当前基础弹窗使用 3px 淡边框" },
                { label: "适用", value: "信息确认、复杂配置、导入向导、大型工作区" },
              ]}
            />
          </DocPage>
        );
      case "menu":
        return (
          <DocPage
            title="Dropdown / Popover / Command"
            description="这三类都属于轻量浮层，但使用目标不同，放在一起最容易横向比较。"
            source="src/components/ui/dropdown-menu.tsx · src/components/ui/popover.tsx · src/components/ui/command.tsx"
            chips={["dropdown", "popover", "command"]}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <DocCard title="Popover / Dropdown" description="看触发器、浮层边框、列表 item 和选中态。">
                <div className="flex flex-wrap gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Open popover</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Inline popover</p>
                        <p className="text-xs text-muted-foreground">适合轻量说明或小配置块。</p>
                      </div>
                      <Input placeholder="Search provider..." />
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Open menu</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          New provider
                          <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Duplicate
                          <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={dropdownBookmarks}
                        onCheckedChange={setDropdownBookmarks}
                      >
                        Show bookmarks
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Density</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={dropdownView} onValueChange={setDropdownView}>
                        <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DocCard>

              <DocCard title="Command" description="用于搜索和命令面板，适合看输入、空态和 group 标题。">
                <div className="overflow-hidden rounded-2xl border border-border/80">
                  <Command>
                    <CommandInput placeholder="搜索组件或页面..." />
                    <CommandList>
                      <CommandEmpty>没有找到匹配项。</CommandEmpty>
                      <CommandGroup heading="Base UI">
                        <CommandItem>
                          <Search className="h-4 w-4" />
                          Button
                        </CommandItem>
                        <CommandItem>
                          <Search className="h-4 w-4" />
                          Input
                        </CommandItem>
                        <CommandItem>
                          <Search className="h-4 w-4" />
                          Dialog
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              </DocCard>
            </div>

            <SpecGrid
              items={[
                { label: "Dropdown", value: "item / checkbox item / radio item" },
                { label: "Popover", value: "内容宽度自适应，适合轻量编辑块" },
                { label: "Command", value: "input / list / group / item / empty" },
                { label: "适用", value: "菜单操作、辅助面板、命令搜索" },
              ]}
            />
          </DocPage>
        );
      case "tooltip":
        return (
          <DocPage
            title="Tooltip & Toast"
            description="这两个都是轻量反馈，但一个是 hover 提示，一个是顶部状态通知。"
            source="src/components/ui/tooltip.tsx · src/components/ui/sonner.tsx"
            chips={["tooltip", "toast", "instant", "success"]}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <DocCard title="Tooltip" description="当前 tooltip 为中性黑底，移入立刻显示，移出立刻消失。">
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="Show tooltip">
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>当前 tooltip 使用中性黑底，立即出现与消失。</TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-muted-foreground">把鼠标移到图标上试试。</span>
                </div>
              </DocCard>

              <DocCard title="Toast" description="顶部 toast 用来验证通知间距、圆角、关闭按钮和成功态文字。">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="ghost"
                    className="p-3"
                    onClick={() => toast.success("这是当前项目真实的 toast 样式。")}
                  >
                    Trigger toast
                  </Button>
                </div>
              </DocCard>
            </div>

            <SpecGrid
              items={[
                { label: "Tooltip", value: "黑底 / 立即显示 / 立即消失 / Portal 提层" },
                { label: "Toast", value: "白底 / 8px padding / 10px 圆角 / 关闭按钮占位" },
                { label: "成功态", value: "成功文字为绿色，背景保持中性" },
                { label: "适用", value: "解释图标、轻量帮助、操作结果反馈" },
              ]}
            />
          </DocPage>
        );
      case "tabs":
        return (
          <DocPage
            title="Tabs"
            description="Tabs 现在分成默认分段样式和 line 页面级导航两种，更适合拆开看。"
            source="src/components/ui/tabs.tsx"
            chips={["default", "line", "active", "hover"]}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <DocCard title="Default tabs" description="更像分段按钮，适合局部区域切换。">
                <Tabs defaultValue="providers" className="space-y-3">
                  <TabsList>
                    <TabsTrigger value="providers">Providers</TabsTrigger>
                    <TabsTrigger value="mcp">MCP</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="providers" className="mt-0 text-sm text-muted-foreground">
                    默认 tabs 更适合块级局部切换。
                  </TabsContent>
                  <TabsContent value="mcp" className="mt-0 text-sm text-muted-foreground">
                    当前项目里很多局部面板都使用这一类。
                  </TabsContent>
                  <TabsContent value="settings" className="mt-0 text-sm text-muted-foreground">
                    当前激活态不再带边框线。
                  </TabsContent>
                </Tabs>
              </DocCard>

              <DocCard title="Line tabs" description="更接近页面级页签，选中线与底边线重合。">
                <Tabs value={lineTabs} onValueChange={setLineTabs} className="space-y-3">
                  <TabsList className="w-full justify-start gap-6 rounded-none border-b border-border/70 bg-transparent p-0 text-sm">
                    <TabsTrigger variant="line" value="preview" className="rounded-none px-0 pb-3 pt-0">
                      Preview
                    </TabsTrigger>
                    <TabsTrigger variant="line" value="usage" className="rounded-none px-0 pb-3 pt-0">
                      Usage
                    </TabsTrigger>
                    <TabsTrigger variant="line" value="about" className="rounded-none px-0 pb-3 pt-0">
                      About
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={lineTabs} className="mt-0 text-sm text-muted-foreground">
                    这是更接近主应用顶部页签的选中表现。
                  </TabsContent>
                </Tabs>
              </DocCard>
            </div>

            <SpecGrid
              items={[
                { label: "默认外层圆角", value: "12px" },
                { label: "按钮圆角", value: "8px" },
                { label: "hover", value: "未选中跟随 SegmentedControl：black/5 / white/5" },
                { label: "适用", value: "局部切换、顶部子导航、页面级页签" },
              ]}
            />
          </DocPage>
        );
      case "segmented":
        return (
          <DocPage
            title="Segmented Control"
            description="这类组件最关键的是容器底色、未选中 hover、已选中 hover 和圆角层级。"
            source="src/components/ui/segmented-control.tsx"
            chips={["container", "item", "active", "hover"]}
          >
            <DocCard title="预览" description="未选中 hover 使用 black/5 或 white/5，已激活 hover 不改背景，只轻微改文字。">
              <SegmentedControl>
                <SegmentedControlItem
                  active={segmentedValue === "preview"}
                  onClick={() => setSegmentedValue("preview")}
                >
                  Preview
                </SegmentedControlItem>
                <SegmentedControlItem
                  active={segmentedValue === "tokens"}
                  onClick={() => setSegmentedValue("tokens")}
                >
                  Tokens
                </SegmentedControlItem>
                <SegmentedControlItem
                  active={segmentedValue === "code"}
                  onClick={() => setSegmentedValue("code")}
                >
                  Code
                </SegmentedControlItem>
              </SegmentedControl>
            </DocCard>

            <SpecGrid
              items={[
                { label: "容器圆角", value: "10px" },
                { label: "按钮圆角", value: "8px" },
                { label: "未选中 hover", value: "浅色 black/5，深色 white/5" },
                { label: "已选中 hover", value: "背景不变，仅文字轻微变浅" },
              ]}
            />
          </DocPage>
        );
      case "feedback":
        return (
          <DocPage
            title="Badge & Alert"
            description="这两个更偏反馈与状态展示，适合放在同一页里做轻量对照。"
            source="src/components/ui/badge.tsx · src/components/ui/alert.tsx"
            chips={["badge", "alert", "default", "destructive"]}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <DocCard title="Badge" description="看胶囊尺寸、描边强度和 destructive 的语义色。">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </DocCard>

              <DocCard title="Alert" description="适合较轻的信息提示、说明块和 destructive 警示。">
                <div className="space-y-3">
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>Default alert</AlertTitle>
                    <AlertDescription>适合较轻的信息提示、说明块和状态提醒。</AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Destructive alert</AlertTitle>
                    <AlertDescription>当前 destructive alert 走红色边框和红色文字。</AlertDescription>
                  </Alert>
                </div>
              </DocCard>
            </div>

            <SpecGrid
              items={[
                { label: "Badge", value: "default / secondary / outline / destructive" },
                { label: "Alert", value: "default / destructive" },
                { label: "交互", value: "Badge 偏静态，Alert 偏块级提示" },
                { label: "适用", value: "状态标签、警告说明、空态提醒" },
              ]}
            />
          </DocPage>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <section className="app-panel overflow-hidden">
              <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Interactive design system workspace
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-semibold tracking-tight">
                        设计系统工作台
                      </h2>
                      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                        这个页面直接复用项目当前的真实基础组件和代表性业务组件，
                        用来回答三个问题：现在有哪些组件、它们长什么样、改基础实现后会不会全局一起变。
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Button</Badge>
                      <Badge variant="secondary">Input</Badge>
                      <Badge variant="secondary">Select</Badge>
                      <Badge variant="secondary">Dialog</Badge>
                      <Badge variant="secondary">Dropdown</Badge>
                      <Badge variant="secondary">Popover</Badge>
                      <Badge variant="secondary">Tooltip</Badge>
                      <Badge variant="secondary">Tabs</Badge>
                      <Badge variant="secondary">Segmented</Badge>
                      <Badge variant="secondary">ProviderCard</Badge>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryItems.map((item) => (
                      <Card key={item.label} className="rounded-2xl bg-card/80">
                        <CardContent className="p-4">
                          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            {item.label}
                          </div>
                          <div className="mt-2 text-2xl font-semibold tracking-tight">
                            {item.value}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.note}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-[28px] p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                    <Palette className="h-4 w-4 text-primary" />
                    主题与视觉基底
                  </div>
                  <ThemeSettings />
                  <div className="mt-5 rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="text-sm font-medium">使用方式</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      先在这里观察组件，确认“悬停、选中、禁用、弹层”是否符合预期；之后如果你指定某个基础组件要调整，我们优先改
                      `src/components/ui/*`，再回到这里做回归确认。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Tabs value={topTab} onValueChange={setTopTab} className="space-y-6">
              <TabsList className="w-fit">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0 space-y-6">
                <ShowcaseSection
                  icon={Palette}
                  title="语义颜色与项目表面"
                  description="这些 token 和语义表面决定了整套界面的气质。"
                >
                  <ColorTokenTable rows={surfaceTokenRows} />
                </ShowcaseSection>

                <ShowcaseSection
                  icon={Palette}
                  title="文本层级"
                  description="除了表面色，还要单独看文本层级，否则很难判断标题、描述和强调信息的关系。"
                >
                  <ColorTokenTable rows={textTokenRows} />
                </ShowcaseSection>

                <ShowcaseSection
                  icon={Sparkles}
                  title="反馈语义色"
                  description="成功、警告、说明、错误这组颜色更偏语义反馈，不一定都来自全局 token，但必须被整理出来。"
                >
                  <ColorTokenTable rows={feedbackTokenRows} />
                </ShowcaseSection>

                <ShowcaseSection
                  icon={SlidersHorizontal}
                  title="业务层补充色"
                  description="这一组不是全局 token，而是目前散落在业务组件里的实现色。先整理出来，后面才好统一收敛。"
                >
                  <ColorTokenTable rows={implementationColorRows} />
                </ShowcaseSection>

                <ShowcaseSection
                  icon={Search}
                  title="交互状态色"
                  description="这组颜色不属于静态 token，而是 hover、active、focus、tooltip、toast 这类交互态里直接使用的实现色。"
                >
                  <ColorTokenTable rows={interactionStateRows} />
                </ShowcaseSection>

                <ShowcaseSection
                  icon={Layers3}
                  title="项目级容器样式"
                  description="这些类不是单独组件，但会强烈影响页面质感。"
                >
                  <div className="grid gap-4 lg:grid-cols-3">
                    <SurfaceCard title="glass" description="轻量毛玻璃浮层">
                      <div className="glass rounded-2xl px-4 py-6">
                        <p className="text-sm font-medium">毛玻璃表面</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          适合轻量浮层或顶部信息块。
                        </p>
                      </div>
                    </SurfaceCard>
                    <SurfaceCard title="glass-card" description="更厚重的设置模块容器">
                      <div className="glass-card rounded-2xl px-4 py-6">
                        <p className="text-sm font-medium">Glass card</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          设置区、说明区和大块内容容器常用。
                        </p>
                      </div>
                    </SurfaceCard>
                    <SurfaceCard title="app-panel" description="应用内容区标准容器">
                      <div className="app-panel rounded-2xl px-4 py-6">
                        <p className="text-sm font-medium">App panel</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          主内容面板常用，最接近实际页面。
                        </p>
                      </div>
                    </SurfaceCard>
                  </div>
                </ShowcaseSection>

                <ShowcaseSection
                  icon={LayoutTemplate}
                  title="组件清单总览"
                  description="先快速知道有哪些组件，再进入交互演示页逐个看。"
                >
                  <div className="grid gap-4 xl:grid-cols-2">
                    <SpecCard title="按钮与操作">
                      <InventoryTable rows={buttonVariantRows} />
                    </SpecCard>
                    <SpecCard title="表单与选择">
                      <InventoryTable rows={formRows} />
                    </SpecCard>
                    <SpecCard title="浮层与弹窗">
                      <InventoryTable rows={overlayRows} />
                    </SpecCard>
                    <SpecCard title="导航与反馈">
                      <InventoryTable rows={navigationRows} />
                    </SpecCard>
                  </div>
                </ShowcaseSection>
              </TabsContent>

              <TabsContent value="components" className="mt-0 space-y-6">
                <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
                  <aside className="self-start rounded-[28px] border border-border/70 bg-card/90 p-4 shadow-sm xl:sticky xl:top-6">
                    <div className="mb-4 space-y-1">
                      <p className="text-sm font-semibold">组件导航</p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        左边选组件，右边只看当前组件的变体、尺寸、状态和真实交互。
                      </p>
                    </div>
                    <div className="space-y-4">
                      {componentDocGroups.map((group) => (
                        <div key={group.title} className="space-y-1.5">
                          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {group.title}
                          </p>
                          <div className="space-y-1">
                            {group.items.map((item) => (
                              <button
                                key={item.key}
                                type="button"
                                onClick={() => setComponentTab(item.key)}
                                className={cn(
                                  "flex w-full cursor-pointer items-start gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors",
                                  componentTab === item.key
                                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5",
                                )}
                              >
                                <div className="min-w-0">
                                  <div className="text-sm font-medium">{item.label}</div>
                                  <div className="text-xs text-muted-foreground">{item.note}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </aside>

                  <div className="min-w-0 space-y-6">{renderComponentDoc()}</div>
                </div>
              </TabsContent>

              <TabsContent value="business" className="mt-0 space-y-6">
                <ShowcaseSection
                  icon={Sparkles}
                  title="真实业务组件"
                  description="这里最适合确认“改了基础组件后，业务卡片有没有一起变得更协调”。"
                >
                  <div className="grid gap-4 xl:grid-cols-2">
                    {providerShowcases.map((item) => (
                      <div key={item.key} className="space-y-2">
                        <div className="px-1">
                          <h3 className="text-sm font-semibold">{item.title}</h3>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <ProviderCard
                          provider={item.provider}
                          appId={item.appId}
                          isCurrent={item.isCurrent ?? false}
                          isInConfig={item.isInConfig ?? true}
                          isOmo={item.isOmo ?? false}
                          isOmoSlim={item.isOmoSlim ?? false}
                          isProxyRunning={false}
                          isAutoFailoverEnabled={item.isAutoFailoverEnabled ?? false}
                          isInFailoverQueue={item.isInFailoverQueue ?? false}
                          failoverPriority={item.failoverPriority}
                          isDefaultModel={item.isDefaultModel ?? false}
                          onSwitch={noop}
                          onEdit={noop}
                          onDelete={noop}
                          onConfigureUsage={noop}
                          onOpenWebsite={noop}
                          onDuplicate={noop}
                          onToggleFailover={noop}
                          onSetAsDefault={noop}
                        />
                      </div>
                    ))}
                  </div>
                </ShowcaseSection>

                <ShowcaseSection
                  icon={Sparkles}
                  title="共享集成卡片"
                  description="这里直接展示 MCP / Skills 共用的卡片壳层，方便回归标题、描述、toggle 与 hover action。"
                >
                  <div className="grid gap-4 xl:grid-cols-3">
                    {sharedCardShowcases.map((item) => (
                      <div key={item.key} className="space-y-2">
                        <div className="px-1">
                          <h3 className="text-sm font-semibold">{item.title}</h3>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <SharedAppEntityCard
                          title={item.cardTitle}
                          description={item.cardDescription}
                          descriptionTitle={item.cardDescriptionTitle}
                          onOpenExternal={item.hasExternalLink ? noop : undefined}
                          externalLabel="Docs"
                          footerLeft={
                            <AppToggleGroup
                              apps={item.apps}
                              onToggle={noop}
                              appIds={MCP_SKILLS_APP_IDS}
                              buttonClassName="h-6 w-6 !rounded-[8px]"
                            />
                          }
                          footerActions={item.footerActions}
                        />
                      </div>
                    ))}
                  </div>
                </ShowcaseSection>

                <ShowcaseSection
                  icon={ChevronRight}
                  title="Settings 风格片段"
                  description="不整页嵌套 SettingsPage，而是挑最能反映风格的片段来预览。"
                >
                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="glass-card rounded-3xl p-6">
                      <ThemeSettings />
                    </div>

                    <div className="space-y-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">Enable local proxy</p>
                          <p className="text-xs text-muted-foreground">
                            模拟设置页里的布尔开关行。
                          </p>
                        </div>
                        <Switch checked />
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">Auto backup</p>
                          <p className="text-xs text-muted-foreground">
                            用于观察设置区块里的信息密度。
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="rounded-2xl border border-border/70 px-4 py-3">
                        <p className="text-sm font-medium">Terminal</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ghostty / Warp / Terminal
                        </p>
                      </div>
                    </div>
                  </div>
                </ShowcaseSection>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Dialog
          open={dialogVariant === "default"}
          onOpenChange={(open) => !open && setDialogVariant(null)}
        >
          <DialogContent variant="default">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle>Default dialog</DialogTitle>
                  <DialogDescription className="mt-2">
                    用于轻量信息编辑或展示。
                  </DialogDescription>
                </div>
                <DialogCloseButton onClick={() => setDialogVariant(null)} />
              </div>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <Input defaultValue="https://api.example.com/v1" />
              <Textarea defaultValue="这里是默认弹窗的正文区域，用来观察 header / body / footer 的空间分配。" />
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogVariant(null)}>
                关闭
              </Button>
              <Button onClick={() => setDialogVariant(null)}>确认</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={dialogVariant === "form"}
          onOpenChange={(open) => !open && setDialogVariant(null)}
        >
          <DialogContent variant="form">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle>Form dialog</DialogTitle>
                  <DialogDescription className="mt-2">
                    更宽的弹窗，适合表单编辑或配置面板。
                  </DialogDescription>
                </div>
                <DialogCloseButton onClick={() => setDialogVariant(null)} />
              </div>
            </DialogHeader>
            <DialogBody className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dialog-provider-name">Provider name</Label>
                  <Input id="dialog-provider-name" defaultValue="OpenAI Compatible" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-provider-format">API format</Label>
                  <Select defaultValue="openai_chat">
                    <SelectTrigger id="dialog-provider-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="openai_chat">OpenAI Chat</SelectItem>
                      <SelectItem value="openai_responses">OpenAI Responses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-notes">Notes</Label>
                <Textarea id="dialog-notes" defaultValue="适合放较复杂的配置项、说明文案和分区表单。" />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogVariant(null)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogVariant(null)}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={dialogVariant === "wizard"}
          onOpenChange={(open) => !open && setDialogVariant(null)}
        >
          <DialogContent variant="wizard">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle>Wizard dialog</DialogTitle>
                  <DialogDescription className="mt-2">
                    适合多步骤引导、导入向导或初始化流程。
                  </DialogDescription>
                </div>
                <DialogCloseButton onClick={() => setDialogVariant(null)} />
              </div>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <WizardStep active title="Step 1" description="选择来源" />
                <WizardStep title="Step 2" description="映射字段" />
                <WizardStep title="Step 3" description="完成导入" />
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                这里可以继续放置向导说明、步骤表单或导入预览区域。
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogVariant(null)}>
                Back
              </Button>
              <Button onClick={() => setDialogVariant(null)}>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={dialogVariant === "fullscreen"}
          onOpenChange={(open) => !open && setDialogVariant(null)}
        >
          <DialogContent variant="fullscreen">
            <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
              <div>
                <DialogTitle>Fullscreen dialog</DialogTitle>
                <DialogDescription className="mt-1">
                  适合大型编辑器、工作区或多列配置面板。
                </DialogDescription>
              </div>
              <DialogCloseButton onClick={() => setDialogVariant(null)} />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[280px_1fr]">
                <div className="space-y-3 rounded-3xl border border-border/70 bg-card p-4">
                  <p className="text-sm font-semibold">侧栏导航</p>
                  <button type="button" className="app-nav-item" data-active="true">
                    Overview
                  </button>
                  <button type="button" className="app-nav-item">
                    Models
                  </button>
                  <button type="button" className="app-nav-item">
                    Tools
                  </button>
                </div>
                <div className="app-panel min-h-[420px] p-6">
                  <p className="text-lg font-semibold">内容区域</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Fullscreen variant 会铺满整个应用窗口，更适合复杂信息架构和长内容编辑。
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          isOpen={confirmOpen}
          title="删除供应商？"
          message="这个示例用于展示项目当前的确认弹窗样式，包括图标、标题、正文和底部操作按钮。"
          onConfirm={() => {
            setConfirmOpen(false);
            setDialogVariant(null);
          }}
          onCancel={() => {
            setConfirmOpen(false);
            setDialogVariant(null);
          }}
        />
      </div>
    </TooltipProvider>
  );
}

function ShowcaseSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SurfaceCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function DocPage({
  title,
  description,
  source,
  chips,
  children,
}: {
  title: string;
  description: string;
  source: string;
  chips: string[];
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-3 rounded-[28px] border border-border/70 bg-card/90 p-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            代码演示
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Badge key={chip} variant="secondary">
              {chip}
            </Badge>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">源码位置：{source}</div>
      </div>

      {children}
    </section>
  );
}

function DocCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[24px]">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">{children}</CardContent>
    </Card>
  );
}

function SpecGrid({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
  }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[20px] border border-border/70 bg-card/70 p-4 shadow-sm"
        >
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {item.label}
          </div>
          <div className="mt-2 text-sm font-medium leading-6">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function ColorTokenTable({
  rows,
}: {
  rows: ColorTokenRow[];
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-border/80 bg-card/90 shadow-sm">
      <div className="grid grid-cols-[220px_220px_220px_minmax(0,1fr)] border-b border-border/70 bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        <div>颜色名称</div>
        <div>Light mode</div>
        <div>Dark mode</div>
        <div>使用说明</div>
      </div>

      {rows.map((row) => (
        <div
          key={row.name}
          className="grid grid-cols-[220px_220px_220px_minmax(0,1fr)] items-center gap-4 border-t border-border/60 px-4 py-4 first:border-t-0"
        >
          <div>
            <code className="rounded-lg bg-muted px-2.5 py-1.5 text-sm font-semibold">{row.name}</code>
          </div>
          <div>
            <div className="inline-flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2">
              <span
                className={cn(
                  "h-8 w-8 rounded-lg border border-black/10",
                  row.lightPreviewClassName,
                )}
              />
              <span className="text-sm font-medium">{row.lightValue}</span>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white">
              <span
                className={cn(
                  "h-8 w-8 rounded-lg border border-white/10",
                  row.darkPreviewClassName,
                )}
              />
              <span className="text-sm font-medium">{row.darkValue}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm leading-6 text-muted-foreground">{row.usage}</div>
            {row.source ? (
              <div className="text-xs text-muted-foreground">
                来源：
                <code className="ml-1 rounded bg-muted px-1.5 py-0.5">{row.source}</code>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function SpecCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>组件</TableHead>
          <TableHead>名字 / 变体</TableHead>
          <TableHead>尺寸</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>源码</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.component}-${row.source}`}>
            <TableCell className="font-medium">{row.component}</TableCell>
            <TableCell className="text-muted-foreground">{row.names}</TableCell>
            <TableCell className="text-muted-foreground">{row.sizes}</TableCell>
            <TableCell className="text-muted-foreground">{row.states}</TableCell>
            <TableCell>
              <code className="rounded bg-muted px-2 py-1 text-xs">{row.source}</code>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function WizardStep({
  title,
  description,
  active = false,
}: {
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={
        active
          ? "rounded-2xl border border-primary/60 bg-primary/5 p-4"
          : "rounded-2xl border border-border/70 bg-card p-4"
      }
    >
      <div className="flex items-center gap-2">
        <div
          className={
            active
              ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
              : "flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
          }
        >
          <Check className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
