# 📚 راهنمای جامع توسعه UI و سیستم استایل‌دهی Fintellect

## فهرست مطالب
1. [Component Development Strategy](#1-component-development-strategy)
2. [shadcn/ui Integration](#2-shadcnui-integration)
3. [Tailwind CSS Architecture](#3-tailwind-css-architecture)
4. [Styling Patterns](#4-styling-patterns)
5. [Form Development](#5-form-development)
6. [Assets Management](#6-assets-management)
7. [Performance Optimization](#7-performance-optimization)
8. [Accessibility (a11y)](#8-accessibility-a11y)
9. [Responsive Design](#9-responsive-design)
10. [مثال‌های عملی](#10-مثالهای-عملی)
11. [پیشنهادات بهبود](#11-پیشنهادات-بهبود)

---

## 1. Component Development Strategy

### 1.1 سلسله‌مراتب کامپوننت‌ها (Modified Atomic Design)

پروژه از یک رویکرد ترکیبی Atomic Design استفاده می‌کند:

```
┌─────────────────────────────────────────────────────────┐
│                      Pages (app/)                        │
│              صفحات Next.js App Router                    │
├─────────────────────────────────────────────────────────┤
│                   Page Views (page-views/)               │
│              کامپوننت‌های سطح صفحه                        │
├─────────────────────────────────────────────────────────┤
│                  Features (components/)                  │
│     auth/, chat/, payment/, subscription/, survey/       │
├─────────────────────────────────────────────────────────┤
│                   Atoms (components/ui/)                 │
│     Button, Input, Dialog, Card, Toast, ...             │
└─────────────────────────────────────────────────────────┘
```

### 1.2 React Best Practices

#### Function Components با TypeScript

```typescript
// ✅ الگوی صحیح - Function Component با Props Interface
interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;  // Optional prop
}

const ChatInput = React.memo(function ChatInput({
  inputValue,
  isLoading,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onFocusChange,
}: ChatInputProps) {
  // Component logic
});

export default ChatInput;
```

#### Custom Hooks برای Logic Separation

```typescript
// src/hooks/auth/useAuth.ts
export const useAuth = () => {
  const { isAuthenticated, user, login, logout } = useAuthStore();
  
  const handleLogin = useCallback(async (phoneNumber: string) => {
    // Login logic
  }, []);
  
  return {
    isAuthenticated,
    user,
    handleLogin,
    handleLogout: logout,
  };
};
```

#### Component Optimization

```typescript
// ✅ استفاده از React.memo برای جلوگیری از re-render غیرضروری
const ChatInput = React.memo(function ChatInput({ ... }: ChatInputProps) {
  // useMemo برای مقادیر محاسباتی
  const containerClassName = useMemo(() => "p-4", []);
  
  const inputContainerClassName = useMemo(
    () => "flex items-center border border-primary rounded-full shadow-sm p-2",
    [],
  );

  // useCallback برای توابع
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value);
  }, [onInputChange]);

  // useRef برای DOM references
  const inputRef = useRef<HTMLInputElement>(null);

  return (/* JSX */);
});
```

#### Composition Pattern

```typescript
// ✅ Composition over Inheritance
// src/components/ui/dialog.tsx
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

// استفاده ترکیبی
<Dialog open={isOpen}>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  </DialogPortal>
</Dialog>
```

### 1.3 Props Interface و Type Safety

```typescript
// ✅ تعریف دقیق Props با TypeScript
interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';  // Union type
  timestamp: Date;
  isTyping?: boolean;          // Optional
  chatMessageId?: number;
  requiresPayment?: boolean;
  onRetry?: (id: number) => void;  // Callback type
}

// ✅ استفاده از Generic Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ✅ Extending HTML Attributes
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```


---

## 2. shadcn/ui Integration

### 2.1 کامپوننت‌های استفاده شده

پروژه از 27 کامپوننت shadcn/ui استفاده می‌کند:

| کامپوننت | کاربرد |
|----------|--------|
| `button` | دکمه‌های اصلی با variants مختلف |
| `input` | فیلدهای ورودی |
| `dialog` | مودال‌ها (AuthModal) |
| `form` | فرم‌ها با react-hook-form |
| `card` | کارت‌های محتوا |
| `toast` | نوتیفیکیشن‌ها |
| `avatar` | آواتار کاربر |
| `scroll-area` | اسکرول سفارشی |
| `separator` | جداکننده |
| `tabs` | تب‌ها |
| `dropdown-menu` | منوی کشویی |
| `tooltip` | راهنمای ابزار |
| `select` | انتخاب‌گر |
| `checkbox` | چک‌باکس |
| `radio-group` | گروه رادیو |
| `switch` | سوییچ |
| `slider` | اسلایدر |
| `textarea` | متن چندخطی |
| `popover` | پاپ‌اور |
| `alert-dialog` | دیالوگ هشدار |
| `badge` | نشان |
| `calendar` | تقویم |
| `command` | کامند پلت |
| `label` | برچسب |
| `resizable` | پنل‌های قابل تغییر اندازه |

### 2.2 Customization و Theming

```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  // Base styles - اعمال به همه variants
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none rounded-full",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary/60 disabled:bg-secondary disabled:text-secondary-foreground",
        outline:
          "bg-transparent text-primary border border-primary hover:bg-secondary hover:text-secondary-foreground",
        secondary:
          "bg-secondary-foreground text-white hover:bg-accent-foreground",
        ghost: "bg-transparent text-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "max-h-14 px-4 py-2",
        sm: "max-h-9 px-3",
        lg: "max-h-11 px-8",
        icon: "max-h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

### 2.3 Override کردن Styles

```typescript
// ✅ Override با className
<Button 
  variant="default"
  className="mb-4 mt-auto w-full rounded-3xl bg-primary py-4 text-white hover:bg-primary/80"
>
  دریافت کد
</Button>

// ✅ Override در تعریف کامپوننت
const DialogContent = React.forwardRef<...>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Base styles
        "fixed left-[50%] top-[50%] z-[70] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200",
        // Animation styles
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        // Custom className override
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
```

### 2.4 اضافه کردن Variants جدید

```typescript
// اضافه کردن variant جدید به toast
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
        // ✅ می‌توان variant جدید اضافه کرد
        success: "border-success bg-success text-success-foreground",
        warning: "border-warning bg-warning text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### 2.5 Compound Components Pattern

```typescript
// src/components/ui/form.tsx - الگوی Compound Components
const Form = FormProvider;

const FormField = <TFieldValues extends FieldValues>({...props}: ControllerProps<TFieldValues>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);

// استفاده
<Form {...form}>
  <FormField
    control={form.control}
    name="phoneNumber"
    render={({ field }) => (
      <FormItem>
        <FormLabel>شماره تلفن</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

## 3. Tailwind CSS Architecture

### 3.1 تنظیمات tailwind.config.ts

```typescript
// tailwind.config.ts
const config = {
  darkMode: ["class"],  // Dark mode با class
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",  // بدون prefix
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Custom configurations...
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### 3.2 Custom Theme

#### Colors با CSS Variables

```typescript
// tailwind.config.ts
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  success: {
    DEFAULT: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
  },
  warning: {
    DEFAULT: "hsl(var(--warning))",
    foreground: "hsl(var(--warning-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  gold: {
    DEFAULT: "hsl(var(--gold))",
    foreground: "hsl(var(--gold-foreground))",
  },
},
```

#### Typography با فونت‌های فارسی

```typescript
fontFamily: {
  sans: ["var(--font-vazir)", "system-ui", "sans-serif"],
  mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  vazir: ["var(--font-vazir)", "system-ui", "sans-serif"],
  morabba: ["var(--font-morabba)", "var(--font-vazir)", "system-ui", "sans-serif"],
},
```

### 3.3 CSS Variables در globals.css

```css
/* src/app/globals.css */
@layer base {
  :root {
    /* Light Theme */
    --background: 0 0% 98%;           /* F9F9F9 */
    --foreground: 252 93% 5%;         /* 06011A */
    --card: 0 0% 100%;                /* FFFFFF */
    --primary: 218 94% 60%;           /* 377EF9 */
    --secondary: 218 95% 92%;         /* D7E5FE */
    --muted: 0 0% 95%;                /* F2F2F2 */
    --destructive: 6 67% 56%;         /* DA5345 */
    --success: 136 49% 51%;           /* 46BE66 */
    --warning: 42 67% 56%;            /* DAAC44 */
    --border: 200 2% 72%;             /* B6B8B9 */
    --radius: 0.5rem;
  }

  .dark {
    /* Dark Theme */
    --background: 0 0% 5%;            /* 0D0D0D */
    --foreground: 0 0% 100%;          /* FFFFFF */
    --card: 0 0% 7%;                  /* 131313 */
    --primary: 211 76% 29%;           /* 124684 */
    --secondary: 212 76% 20%;         /* 0C2F58 */
    --muted: 252 5% 20%;              /* 313035 */
    --destructive: 6 59% 58%;         /* D36155 */
  }
}
```

### 3.4 Custom Typography System

```css
/* src/app/globals.css */
@layer components {
  /* Desktop Typography (md+) */
  @media (min-width: 768px) {
    .text-h1 {
      font-size: 64px !important;
      line-height: 83px !important;
      letter-spacing: -0.03em !important;
      font-weight: 700 !important;
    }
    .text-h2 {
      font-size: 55px !important;
      line-height: 76px !important;
      letter-spacing: -0.03em !important;
      font-weight: 700 !important;
    }
    .text-body {
      font-size: 24px !important;
      line-height: 27px !important;
      letter-spacing: -0.03em !important;
      font-weight: 500 !important;
    }
    .text-normal3 {
      font-size: 16px !important;
      line-height: 100% !important;
      letter-spacing: -0.03em !important;
      font-weight: 300 !important;
    }
    .text-caption {
      font-size: 12px !important;
      line-height: 100% !important;
      letter-spacing: -0.03em !important;
      font-weight: 500 !important;
    }
  }

  /* Mobile Typography */
  @media (max-width: 767px) {
    .text-h1 {
      font-size: 32px !important;
      line-height: 42px !important;
    }
    .text-body {
      font-size: 18px !important;
      line-height: 24px !important;
    }
  }
}
```

### 3.5 Dark Mode Implementation

```css
/* پس‌زمینه گرادیانت برای Dark Mode */
.dark body {
  background:
    radial-gradient(
      35% 60% at 100% 50%,
      rgba(18, 70, 132, 0.2) 0%,
      rgba(19, 19, 19, 0) 100%
    ),
    hsl(var(--background));
}

/* موبایل */
@media (max-width: 768px) {
  .dark body {
    background:
      radial-gradient(
        45% 50% at 50% 0%,
        rgba(18, 70, 132, 0.2) 0%,
        rgba(19, 19, 19, 0) 100%
      ),
      hsl(var(--background));
  }
}
```

### 3.6 Custom Animations

```css
/* Vibrate animation for modal */
@keyframes vibrate {
  0%, 100% { transform: translate(-50%, -50%) translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translate(-50%, -50%) translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translate(-50%, -50%) translateX(10px); }
}

.animate-vibrate {
  animation: vibrate 0.5s ease-in-out;
}
```

```typescript
// tailwind.config.ts - Radix UI animations
keyframes: {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },
},
animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
},
```


---

## 4. Styling Patterns

### 4.1 استفاده از cn() (clsx + tailwind-merge)

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### مثال‌های استفاده

```typescript
// ✅ ترکیب کلاس‌های ثابت و شرطی
<div className={cn(
  "rounded-lg p-4",                           // Base styles
  role === 'user' ? "bg-primary" : "bg-muted" // Conditional
)}>

// ✅ Override کردن styles
<Button className={cn(buttonVariants({ variant, size }), className)} />

// ✅ کلاس‌های متعدد شرطی
<Input
  className={cn(
    "py-3 pr-10",
    theme === "dark" 
      ? "bg-zinc-800 text-zinc-100 placeholder-zinc-400"
      : "bg-muted text-zinc-900 placeholder-zinc-500",
    phoneValidation.isValid && phoneWatchedValues.phoneNumber
      ? "border-green-500"
      : phoneValidation.isValid === false && phoneWatchedValues.phoneNumber
        ? "border-red-500"
        : "",
    "focus:outline-none focus:ring-0"
  )}
/>
```

### 4.2 Conditional Styling

```typescript
// ✅ با Ternary Operator
<div className={`
  relative max-w-[200px] md:max-w-[600px] rounded-lg rounded-tr-none px-4 py-3
  ${message.isCanceled
    ? "border-2 border-destructive/50 bg-primary text-primary-foreground"
    : "bg-primary text-primary-foreground"
  }
`}>

// ✅ با cn() و شرط‌های پیچیده
<Input
  className={cn(
    "h-10 w-10 border border-muted bg-background text-center text-lg font-bold",
    !error && isComplete && "border-green-500",
    !error && !isComplete && focusedIndex === index && "border-primary",
    error && "border-destructive",
    (disabled || isLoading) 
      ? "cursor-not-allowed opacity-50" 
      : "hover:border-primary",
    "transition-all duration-200 focus:outline-none"
  )}
/>
```

### 4.3 Dynamic Styles based on Props

```typescript
// ✅ استفاده از useMemo برای styles پویا
const ChatInput = React.memo(function ChatInput({ ... }) {
  const containerClassName = useMemo(() => "p-4", []);
  
  const inputContainerClassName = useMemo(
    () => "flex items-center border border-primary rounded-full shadow-sm p-2 md:p-3 bg-card h-14 md:h-16",
    [],
  );

  const inputClassName = useMemo(
    () => "w-full outline-none bg-transparent focus:outline-none resize-none text-foreground text-normal3",
    [],
  );

  return (
    <div className={containerClassName}>
      <div className={inputContainerClassName}>
        <input className={inputClassName} />
      </div>
    </div>
  );
});
```

### 4.4 CSS Variables برای Theming

```typescript
// ✅ استفاده از CSS Variables در کامپوننت‌ها
<div className="bg-background text-foreground">
  <span className="text-primary">متن اصلی</span>
  <span className="text-muted-foreground">متن ثانویه</span>
</div>

// ✅ تغییر تم با JavaScript
const { theme, toggleTheme } = useThemeStore();

// در store
setTheme: (theme) => {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  set({ theme });
},
```

### 4.5 Animation و Transitions

```typescript
// ✅ Framer Motion برای انیمیشن‌های پیچیده
import { motion } from "framer-motion";

<motion.div
  className="flex justify-center gap-2"
  animate={isShaking ? {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  } : {}}
>
  {/* OTP inputs */}
</motion.div>

<motion.p
  className="text-caption text-center text-destructive mt-4"
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {error}
</motion.p>

// ✅ Tailwind Transitions
<span className={`
  inline-flex h-7 w-7 items-center justify-center rounded-full bg-card shadow-lg
  transition-transform
  ${isDark ? "translate-x-1" : "translate-x-20"}
`} />

// ✅ CSS Animations
<span className="animate-pulse">|</span>  // Cursor blink
```

---

## 5. Form Development

### 5.1 React Hook Form Setup

```typescript
// src/components/auth/AuthModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneFormSchema } from "@/lib/validations/auth";

interface PhoneFormData {
  phoneNumber: string;
}

// Setup
const phoneForm = useForm<PhoneFormData>({
  resolver: zodResolver(phoneFormSchema),
  mode: "onChange",  // Validate on change
});

// Watch values
const phoneWatchedValues = phoneForm.watch();

// Submit handler
const handlePhoneSubmit = async (data: PhoneFormData) => {
  const phoneToSend = data.phoneNumber || "";
  // API call...
};
```

### 5.2 Zod Validation Schemas

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod';

// ✅ Schema ساده
export const phoneNumberSchema = z.string()
  .min(1, 'شماره تلفن الزامی است')
  .refine((phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^09\d{9}$/.test(cleanPhone);
  }, 'شماره تلفن باید 11 رقم باشد و با 09 شروع شود');

// ✅ Schema با regex فارسی
const persianNameSchema = z.string()
  .min(2, 'حداقل 2 کاراکتر الزامی است')
  .max(50, 'حداکثر 50 کاراکتر مجاز است')
  .regex(/^[\u0600-\u06FF\s]+$/, 'فقط حروف فارسی مجاز است');

// ✅ Schema ترکیبی
export const loginFormSchema = z.object({
  firstName: persianNameSchema,
  lastName: persianNameSchema,
  phoneNumber: phoneNumberSchema
});

// ✅ Schema برای OTP (آرایه)
export const otpFormSchema = z.object({
  otp: z.array(z.string().length(1, 'هر خانه باید یک رقم باشد'))
    .length(6, 'کد تایید باید 6 رقم باشد')
});

// ✅ Type inference از Schema
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type OtpFormData = z.infer<typeof otpFormSchema>;
```

### 5.3 Error Handling و Display

```typescript
// ✅ نمایش خطاهای فرم
{phoneForm.formState.errors.phoneNumber && phoneWatchedValues.phoneNumber && (
  <p className="text-caption text-nowrap text-destructive">
    {phoneForm.formState.errors.phoneNumber.message}
  </p>
)}

// ✅ نمایش پیام موفقیت
{!phoneForm.formState.errors.phoneNumber && 
  phoneValidation.isValid && 
  phoneWatchedValues.phoneNumber && (
  <p className="text-caption text-success">
    ✓ شماره تلفن معتبر است
  </p>
)}

// ✅ نمایش خطای API
{error && (
  <div className="rounded-lg border border-destructive/20 bg-destructive/50 p-3">
    <p className="text-caption text-center text-destructive">
      {error}
    </p>
  </div>
)}
```

### 5.4 Custom Form Components

```typescript
// ✅ OTP Input Component
interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  error?: string;
  isLoading?: boolean;
}

export function OtpInput({ value, onChange, onComplete, disabled, error, isLoading }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, inputValue: string) => {
    if (disabled || isLoading) return;
    
    const digit = inputValue.slice(-1);
    if (!/^\d$/.test(digit) && digit !== "") return;

    const newValue = [...value];
    newValue[index] = digit;
    onChange(newValue);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      onChange(pastedData.split(""));
    }
  };

  return (
    <div className="flex justify-center gap-2" dir="ltr">
      {Array.from({ length: 6 }, (_, index) => (
        <Input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onPaste={handlePaste}
          disabled={disabled || isLoading}
          className={cn(
            "h-10 w-10 text-center text-lg font-bold",
            error && "border-destructive"
          )}
        />
      ))}
    </div>
  );
}
```

### 5.5 Form با shadcn/ui

```typescript
// استفاده از Form components
<form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}>
  <div className="space-y-2">
    <div className="relative">
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <CallIcon />
      </div>
      <Input
        id="phoneNumber"
        placeholder="شماره تماس"
        inputMode="numeric"
        value={phoneWatchedValues.phoneNumber || ""}
        onChange={(e) => {
          const formatted = formatPhoneInput(e.target.value);
          phoneForm.setValue("phoneNumber", formatted, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canSubmitPhone && !isLoading) {
            e.preventDefault();
            phoneForm.handleSubmit(handlePhoneSubmit)();
          }
        }}
        className="py-3 pr-10"
        disabled={isLoading}
      />
    </div>
  </div>

  <Button
    type="submit"
    variant="default"
    className="w-full"
    disabled={isLoading || !canSubmitPhone}
  >
    {isLoading ? "در حال بررسی..." : "دریافت کد"}
  </Button>
</form>
```


---

## 6. Assets Management

### 6.1 سازماندهی فایل‌ها

```
public/
├── fonts/
│   ├── morabba/           # فونت Morabba (8 وزن)
│   │   ├── Morabba-UltraLight.ttf
│   │   ├── Morabba-Light.ttf
│   │   ├── Morabba-Regular.ttf
│   │   ├── Morabba-Medium.ttf
│   │   ├── Morabba-SemiBold.ttf
│   │   ├── Morabba-Bold.ttf
│   │   ├── Morabba-ExtraBold.ttf
│   │   └── Morabba-Black.ttf
│   └── vazir/             # فونت Vazir (6 وزن)
│       ├── Vazir-Thin.ttf
│       ├── Vazir-Light.ttf
│       ├── Vazir-Regular.ttf
│       ├── Vazir-Medium.ttf
│       ├── Vazir-Bold.ttf
│       └── Vazir-Black.ttf
├── images/
│   ├── logo.png
│   └── bot.svg
└── ...

src/components/icons/      # SVG Icons (34 آیکون)
├── index.ts              # Export همه آیکون‌ها
├── Add.svg
├── Call.svg
├── Close.svg
├── Send.svg
├── ...
```

### 6.2 Next.js Image Component

```typescript
// ✅ استفاده از next/image برای بهینه‌سازی
import Image from "next/image";

// با اندازه ثابت
<Image
  src="/images/logo.png"
  alt="Logo"
  width={32}
  height={32}
  className="rounded-lg"
/>

// با priority برای LCP
<Image
  src="/images/logo.png"
  alt="Logo"
  width={100}
  height={100}
  className="opacity-30 md:h-[120px] md:w-[120px]"
  priority
/>

// با object-fit
<Image
  src="/images/bot.svg"
  alt="bot"
  width={100}
  height={120}
  className="cursor-pointer object-contain transition-transform hover:scale-105"
  onClick={handleBotClick}
/>
```

### 6.3 SVG Icons Management با SVGR

```javascript
// next.config.js
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};
```

```typescript
// src/components/icons/index.ts
export { default as AddIcon } from "./Add.svg";
export { default as CallIcon } from "./Call.svg";
export { default as CloseIcon } from "./Close.svg";
export { default as SendIcon } from "./Send.svg";
export { default as SearchIcon } from "./Search 1.svg";
export { default as SunIcon } from "./Sun 1.svg";
export { default as MoonIcon } from "./Moon.svg";
// ... 34 آیکون

// استفاده در کامپوننت‌ها
import { SendIcon, CallIcon, SearchIcon } from "@/components/icons";

<Button variant="default" size="icon">
  <SendIcon />
</Button>

<div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
  <CallIcon />
</div>
```

### 6.4 فونت‌های Local

```typescript
// src/app/layout.tsx
import localFont from "next/font/local";

const vazir = localFont({
  src: [
    { path: "../../public/fonts/vazir/Vazir-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../public/fonts/vazir/Vazir-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/vazir/Vazir-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/vazir/Vazir-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/vazir/Vazir-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/vazir/Vazir-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-vazir",
  display: "swap",  // Font display strategy
});

// اعمال به HTML
<html className={`${vazir.variable} ${morabba.variable}`}>
```

---

## 7. Performance Optimization

### 7.1 React.memo برای جلوگیری از Re-render

```typescript
// ✅ همه کامپوننت‌های اصلی با React.memo
const ChatInput = React.memo(function ChatInput({ ... }: ChatInputProps) {
  // ...
});

const ChatHeader = React.memo(function ChatHeader({ ... }: ChatHeaderProps) {
  // ...
});

const MessagesArea = React.memo(function MessagesArea({ ... }: MessagesAreaProps) {
  // ...
});

const ChatSidebar = React.memo(function ChatSidebar({ ... }: ChatSidebarProps) {
  // ...
});
```

### 7.2 useMemo و useCallback

```typescript
// ✅ useMemo برای مقادیر محاسباتی
const containerClassName = useMemo(() => "p-4", []);

const inputContainerClassName = useMemo(
  () => "flex items-center border border-primary rounded-full",
  [],
);

// ✅ useCallback برای توابع
const addMessage = useCallback((message: Message) => {
  setMessages((prev) => [...prev, message]);
}, []);

const createNewChat = useCallback(() => {
  const newChatId = Date.now().toString();
  setCurrentChatId(newChatId);
  setMessages([]);
  return newChatId;
}, []);

const scrollToBottom = useCallback(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, []);
```

### 7.3 Lazy Loading و Code Splitting

```typescript
// ✅ Dynamic import برای کامپوننت‌های سنگین
import dynamic from 'next/dynamic';

const TurnstileWidget = dynamic(
  () => import('./TurnstileWidget').then(mod => mod.TurnstileWidget),
  { ssr: false, loading: () => <div>Loading...</div> }
);

// ✅ Lazy loading برای تصاویر
<Image
  src="/images/logo.png"
  alt="Logo"
  loading="lazy"  // Default behavior
  // یا
  priority  // برای تصاویر مهم
/>
```

### 7.4 Virtualization برای لیست‌های بزرگ

```typescript
// ✅ Infinite scroll با anchor-based position restoration
useEffect(() => {
  const wasLoading = isLoadingMoreRef.current;
  isLoadingMoreRef.current = isLoadingMore;

  // Before loading: save anchor element position
  if (isLoadingMore && !wasLoading && messagesContainerRef.current) {
    const container = messagesContainerRef.current;
    const messageElements = container.querySelectorAll("[data-message-id]");
    
    for (let i = 0; i < messageElements.length; i++) {
      const element = messageElements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      if (rect.top >= containerRect.top && rect.top <= containerRect.bottom) {
        anchorMessageIdRef.current = element.getAttribute("data-message-id") || "";
        anchorOffsetRef.current = rect.top - containerRect.top;
        break;
      }
    }
  }

  // After loading: restore position using anchor
  if (!isLoadingMore && wasLoading && anchorMessageIdRef.current) {
    setTimeout(() => {
      const anchorElement = container.querySelector(
        `[data-message-id="${anchorMessageIdRef.current}"]`
      );
      if (anchorElement) {
        // Restore scroll position
        container.scrollTop = container.scrollTop + scrollAdjustment;
      }
    }, 100);
  }
}, [isLoadingMore]);
```

### 7.5 requestAnimationFrame برای انیمیشن‌ها

```typescript
// src/components/chat/TypeWriter.tsx
useEffect(() => {
  const animate = (currentTime: number) => {
    if (lastUpdateRef.current === 0) {
      lastUpdateRef.current = currentTime;
    }

    const elapsed = currentTime - lastUpdateRef.current;

    if (elapsed >= speed) {
      const charsToAdd = Math.max(1, Math.floor(elapsed / speed));
      const endIdx = Math.min(currentIdx + charsToAdd, currentText.length);
      const newText = currentText.slice(0, endIdx);

      setDisplayedText(newText);
      indexRef.current = endIdx;
      lastUpdateRef.current = currentTime;
    }

    if (indexRef.current < textRef.current.length) {
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  rafRef.current = requestAnimationFrame(animate);

  return () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };
}, [/* deps */]);
```

---

## 8. Accessibility (a11y)

### 8.1 ARIA Attributes

```typescript
// ✅ aria-label برای دکمه‌های آیکون
<Button
  variant="ghost"
  size="icon"
  onClick={onToggleSidebar}
  aria-label="Toggle sidebar"
>
  <MenuHamburgerIcon />
</Button>

<Button
  variant="ghost"
  size="icon"
  aria-label="Notifications"
>
  <NotificationIcon />
</Button>

// ✅ role و aria-checked برای سوییچ
<button
  onClick={toggleTheme}
  role="switch"
  aria-checked={isDark}
  className="relative inline-flex h-9 w-28 items-center rounded-full"
>
  {/* ... */}
</button>

// ✅ aria-describedby و aria-invalid برای فرم‌ها
<Slot
  ref={ref}
  id={formItemId}
  aria-describedby={
    !error
      ? `${formDescriptionId}`
      : `${formDescriptionId} ${formMessageId}`
  }
  aria-invalid={!!error}
  {...props}
/>
```

### 8.2 Screen Reader Support

```typescript
// ✅ sr-only برای متن‌های فقط screen reader
<DialogPrimitive.Close className="absolute right-4 top-4">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</DialogPrimitive.Close>

// ✅ title برای tooltip
<Button
  variant="ghost"
  size="icon"
  title="پاسخ مفید بود"
>
  <LikeIcon />
</Button>
```

### 8.3 Keyboard Navigation

```typescript
// ✅ پشتیبانی از Enter key
onKeyDown={(e) => {
  if (e.key === "Enter" && canSubmitPhone && !isLoading) {
    e.preventDefault();
    phoneForm.handleSubmit(handlePhoneSubmit)();
  }
}}

// ✅ Arrow keys برای OTP
const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
  if (e.key === "Backspace") {
    if (value[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  } else if (e.key === "ArrowLeft" && index > 0) {
    inputRefs.current[index - 1]?.focus();
  } else if (e.key === "ArrowRight" && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};
```

### 8.4 Focus Management

```typescript
// ✅ focus-visible styles
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// ✅ Auto-focus
useEffect(() => {
  if (inputRefs.current[0]) {
    inputRefs.current[0].focus();
  }
}, []);
```


---

## 9. Responsive Design

### 9.1 Mobile-First Approach

```typescript
// ✅ Mobile-first با md: breakpoint
<div className="p-2 md:p-3">  // کوچک‌تر در موبایل
<div className="h-14 md:h-16">  // ارتفاع کمتر در موبایل
<div className="max-w-[200px] md:max-w-[600px]">  // عرض کمتر در موبایل

// ✅ نمایش/مخفی کردن
<header className="md:hidden">  // فقط موبایل
<div className="hidden md:flex">  // فقط دسکتاپ
```

### 9.2 Breakpoint Strategy

```css
/* globals.css - Typography breakpoints */
@media (min-width: 768px) {
  .text-h1 { font-size: 64px !important; }
  .text-body { font-size: 24px !important; }
}

@media (max-width: 767px) {
  .text-h1 { font-size: 32px !important; }
  .text-body { font-size: 18px !important; }
}
```

### 9.3 Adaptive Components

```typescript
// ✅ ChatHeader - فقط موبایل
const ChatHeader = React.memo(function ChatHeader({ onToggleSidebar, onNewChat }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-6 md:hidden">
      {/* Mobile header content */}
    </header>
  );
});

// ✅ ChatSidebar - Responsive با overlay
<aside className={`
  fixed right-0 top-0 z-50 flex h-full w-64 flex-col bg-transparent 
  transition-transform duration-300 ease-in-out 
  md:relative md:p-4
  ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
`}>

// ✅ Mobile overlay
{isOpen && (
  <div
    className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
    onClick={onClose}
  />
)}
```

### 9.4 Touch-Friendly UI

```typescript
// ✅ اندازه مناسب برای لمس (حداقل 44px)
<Button size="icon" className="h-10 w-10">  // 40px
<Input className="h-10 w-10 sm:h-12 sm:w-12">  // 40-48px

// ✅ فاصله مناسب بین عناصر
<div className="flex items-center gap-2">
<div className="grid grid-cols-2 gap-4 md:gap-6">

// ✅ Swipe gestures با Radix
"data-[swipe=cancel]:translate-x-0 
 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] 
 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]"
```

---

## 10. مثال‌های عملی

### 10.1 فرم پیچیده با Validation (AuthModal)

```typescript
// src/components/auth/AuthModal.tsx
export function AuthModal({ isOpen, onSuccess }: AuthModalProps) {
  const { theme } = useThemeStore();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otpData, setOtpData] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneFormSchema),
    mode: "onChange",
  });

  const phoneWatchedValues = phoneForm.watch();
  const phoneValidation = validateAndFormatPhone(phoneWatchedValues.phoneNumber || "");
  
  const canSubmitPhone = phoneWatchedValues.phoneNumber &&
    phoneWatchedValues.phoneNumber.startsWith("09") &&
    phoneWatchedValues.phoneNumber.length >= 3 &&
    !phoneForm.formState.errors.phoneNumber;

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setError("");
    try {
      const response = await sendOtpMutation.mutateAsync({
        phoneNumber: data.phoneNumber,
      });
      if (response.success) {
        setStep("otp");
        setOtpCountdown(120);
      } else {
        setError(response.message || "خطا در ارسال کد تایید");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارتباط با سرور");
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className={cn(
          "fixed left-[50%] top-[50%] z-[500] h-[328px] w-[314px] translate-x-[-50%] translate-y-[-50%] rounded-[40px] border bg-background px-12 py-8",
          isVibrating && "animate-vibrate"
        )}>
          {step === "phone" && (
            <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}>
              <Input
                placeholder="شماره تماس"
                inputMode="numeric"
                value={phoneWatchedValues.phoneNumber || ""}
                onChange={(e) => {
                  phoneForm.setValue("phoneNumber", formatPhoneInput(e.target.value), {
                    shouldValidate: true,
                  });
                }}
                className={cn(
                  "py-3 pr-10",
                  phoneValidation.isValid ? "border-green-500" : 
                  phoneValidation.isValid === false ? "border-red-500" : ""
                )}
              />
              {phoneForm.formState.errors.phoneNumber && (
                <p className="text-caption text-destructive">
                  {phoneForm.formState.errors.phoneNumber.message}
                </p>
              )}
              <Button type="submit" disabled={!canSubmitPhone}>
                دریافت کد
              </Button>
            </form>
          )}

          {step === "otp" && (
            <OtpInput
              value={otpData}
              onChange={setOtpData}
              onComplete={handleOtpSubmit}
              error={error}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
```

### 10.2 Modal/Dialog Component

```typescript
// src/components/ui/dialog.tsx
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Position
        "fixed left-[50%] top-[50%] z-[70] translate-x-[-50%] translate-y-[-50%]",
        // Size
        "grid w-full max-w-lg gap-4",
        // Style
        "border p-6 shadow-lg sm:rounded-lg",
        // Animation
        "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
```

### 10.3 Reusable Card Component

```typescript
// src/components/ui/card.tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);

// استفاده
<Card>
  <CardHeader>
    <CardTitle>عنوان کارت</CardTitle>
    <CardDescription>توضیحات کارت</CardDescription>
  </CardHeader>
  <CardContent>
    محتوای کارت
  </CardContent>
  <CardFooter>
    <Button>عملیات</Button>
  </CardFooter>
</Card>
```

### 10.4 Navigation Component (Sidebar)

```typescript
// src/components/chat/ChatSidebar.tsx
const ChatSidebar = React.memo(function ChatSidebar({
  isOpen, onClose, isAuthenticated, onLogin, onLogout, onNewChat
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed right-0 top-0 z-50 flex h-full w-64 flex-col bg-transparent 
        transition-transform duration-300 ease-in-out md:relative md:p-4
        ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
      `}>
        <div className="flex h-full flex-col rounded-l-3xl bg-card md:rounded-3xl">
          {/* Close button - Mobile only */}
          <div className="flex justify-end p-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
              <CloseIcon />
            </Button>
          </div>

          {/* Header - Desktop only */}
          <div className="hidden items-center justify-between p-4 md:flex">
            <div className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Logo" width={32} height={32} />
              <h2 className="text-body">{MOCK_SIDEBAR_BRANDING.title}</h2>
            </div>
          </div>

          {/* Search */}
          <div className="px-3">
            <div className="relative flex items-center gap-2">
              <Input placeholder="جستجو" className="rounded-full bg-muted pr-10" />
              <Button variant="ghost" size="icon" onClick={onNewChat}>
                <EditSquareIcon />
              </Button>
            </div>
          </div>

          {/* Menu items */}
          <ScrollArea className="flex-1 px-3">
            <nav className="py-2">
              {MOCK_SIDEBAR_MENU_ITEMS.map((item, index, array) => (
                <React.Fragment key={item.id}>
                  <Button variant="ghost" className={cn(
                    "flex h-auto w-full justify-between gap-2 px-3 py-2",
                    item.active && "bg-secondary"
                  )}>
                    <span className="text-normal3">{item.label}</span>
                    {getIconComponent(item.icon)}
                  </Button>
                  {index < array.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </nav>
          </ScrollArea>

          {/* Bottom - Profile or Login */}
          <div className="px-4 pb-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 rounded-xl bg-muted px-2 py-3">
                <Avatar><AvatarFallback className="bg-gold">کا</AvatarFallback></Avatar>
                <div>
                  <p className="text-normal3">نام کاربر</p>
                  <p className="text-caption text-muted-foreground">09123456789</p>
                </div>
              </div>
            ) : (
              <Button onClick={onLogin} className="w-full">ورود / ثبت نام</Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
});
```

### 10.5 Confirm Action Component

```typescript
// src/components/chat/ConfirmAction.tsx
interface ConfirmActionProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmAction({ message, onConfirm, onCancel }: ConfirmActionProps) {
  return (
    <div 
      className="absolute top-full right-0 mt-1 z-50 rounded-lg shadow-lg border bg-card border-border px-3 py-2 min-w-[200px]"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-body text-nowrap text-foreground">{message}</p>
      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} variant="ghost" size="sm">لغو</Button>
        <Button onClick={onConfirm} variant="destructive" size="sm">تایید</Button>
      </div>
    </div>
  );
}
```


---

## 11. پیشنهادات بهبود

### 11.1 Error Handling

| پیشنهاد | توضیح | اولویت |
|---------|-------|--------|
| ✨ Sentry Integration | Error Tracking و Monitoring | بالا |
| ✨ Retry Strategy پیشرفته | با Exponential Backoff | بالا |
| ✨ Circuit Breaker Pattern | جلوگیری از cascade failures | متوسط |
| ⚠️ پیام‌های خطای دقیق‌تر | UX بهتر برای کاربر | بالا |
| ⚠️ Offline Mode Support | کار کردن بدون اینترنت | متوسط |
| ⚠️ Error Boundary | جلوگیری از crash کل اپ | بالا |

```typescript
// پیشنهاد: Error Boundary Component
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 11.2 Performance

| پیشنهاد | توضیح | اولویت |
|---------|-------|--------|
| ⚡ Request Deduplication | جلوگیری از درخواست‌های تکراری | بالا |
| ⚡ Response Caching | کش کردن پاسخ‌های API | بالا |
| ⚡ Optimistic Updates | آپدیت UI قبل از پاسخ سرور | متوسط |
| ⚡ Request Cancellation | لغو درخواست‌های قدیمی | متوسط |
| ⚡ Code Splitting | برای TurnstileWidget و AuthModal | بالا |
| ⚡ Lazy Loading | برای کامپوننت‌های سنگین | بالا |
| ⚡ Debounce | برای اعتبارسنجی فرم‌ها | متوسط |
| ⚡ Web Workers | برای Hash Generation | پایین |
| ⚡ IndexedDB | برای Storage بزرگ | پایین |

```typescript
// پیشنهاد: Optimistic Update
const sendMessage = useMutation({
  mutationFn: sendDebateMessage,
  onMutate: async (newMessage) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['messages'] });
    
    // Snapshot previous value
    const previousMessages = queryClient.getQueryData(['messages']);
    
    // Optimistically update
    queryClient.setQueryData(['messages'], (old) => [...old, newMessage]);
    
    return { previousMessages };
  },
  onError: (err, newMessage, context) => {
    // Rollback on error
    queryClient.setQueryData(['messages'], context.previousMessages);
  },
});
```

### 11.3 Security

| پیشنهاد | توضیح | اولویت |
|---------|-------|--------|
| 🔒 Request Signing | امضای درخواست‌ها | متوسط |
| 🔒 HTTPS Only | فقط HTTPS | بالا |
| 🔒 Certificate Pinning | برای اپ موبایل | پایین |
| 🔒 CORS Configuration | تنظیمات صحیح CORS | بالا |
| 🔐 PKCE for OAuth | برای OAuth flows | متوسط |
| 🔐 Device Fingerprinting | شناسایی دستگاه | پایین |
| 🔐 Anomaly Detection | تشخیص رفتار غیرعادی | پایین |
| 🔐 Secure Storage API | ذخیره‌سازی امن | متوسط |

### 11.4 Token Management

| پیشنهاد | توضیح | اولویت |
|---------|-------|--------|
| 🔒 Web Crypto API | برای Hash امن | متوسط |
| 🔒 Token Rotation Strategy | چرخش توکن‌ها | بالا |
| 🔒 HttpOnly Cookie | برای Refresh Token | بالا |
| 🔒 Token Encryption | رمزنگاری توکن‌ها | متوسط |

```typescript
// پیشنهاد: HttpOnly Cookie برای Refresh Token
// Backend باید refresh token را در HttpOnly cookie ذخیره کند
// Frontend فقط access token را در memory نگه می‌دارد

// api/auth/refresh-token
export async function POST(request: Request) {
  const refreshToken = request.cookies.get('refresh_token');
  
  const newTokens = await refreshTokens(refreshToken);
  
  const response = NextResponse.json({ accessToken: newTokens.accessToken });
  response.cookies.set('refresh_token', newTokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  
  return response;
}
```

### 11.5 SMS Detection

| پیشنهاد | توضیح | اولویت |
|---------|-------|--------|
| 📱 Fallback برای مرورگرهای قدیمی | پشتیبانی گسترده‌تر | بالا |
| 📱 Manual Input Suggestion | راهنمای ورود دستی | متوسط |
| 📱 Clipboard API Integration | خواندن از کلیپ‌بورد | متوسط |
| 📱 Custom SMS Format Support | پشتیبانی فرمت‌های مختلف | پایین |

```typescript
// پیشنهاد: Clipboard API Integration
const handlePasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    const otp = text.match(/\d{6}/)?.[0];
    if (otp) {
      setOtpData(otp.split(''));
      handleOtpSubmit(otp);
    }
  } catch (err) {
    console.log('Clipboard access denied');
  }
};
```

### 11.6 Accessibility Improvements

| پیشنهاد | توضیح | اولویت |
|---------|-------|--------|
| ♿ Skip Links | پرش به محتوای اصلی | متوسط |
| ♿ Focus Trap در Modal | محدود کردن focus | بالا |
| ♿ Live Regions | اعلان تغییرات به screen reader | متوسط |
| ♿ Reduced Motion | برای کاربران حساس به حرکت | پایین |

```typescript
// پیشنهاد: Reduced Motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  animate={prefersReducedMotion ? {} : {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  }}
>
```

### 11.7 Testing

| پیشنهاد | توضیح | اولویت |
|---------|-------|--------|
| 🧪 Unit Tests | برای hooks و utils | بالا |
| 🧪 Component Tests | با React Testing Library | بالا |
| 🧪 E2E Tests | با Playwright یا Cypress | متوسط |
| 🧪 Visual Regression | با Chromatic یا Percy | پایین |
| 🧪 Storybook | برای Component Documentation | متوسط |

```typescript
// پیشنهاد: Component Test
import { render, screen, fireEvent } from '@testing-library/react';
import { OtpInput } from './OtpInput';

describe('OtpInput', () => {
  it('should auto-focus next input on digit entry', () => {
    const onChange = jest.fn();
    render(<OtpInput value={['', '', '', '', '', '']} onChange={onChange} />);
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('should call onComplete when all digits entered', () => {
    const onComplete = jest.fn();
    render(<OtpInput value={['1', '2', '3', '4', '5', '6']} onComplete={onComplete} />);
    
    expect(onComplete).toHaveBeenCalledWith('123456');
  });
});
```

---

## 📝 خلاصه

این داکیومنت شامل تمام جنبه‌های توسعه UI و سیستم استایل‌دهی پروژه Fintellect است:

- **Component Strategy**: Atomic Design با React Best Practices
- **shadcn/ui**: 27 کامپوننت با customization کامل
- **Tailwind CSS**: سیستم تم با CSS Variables و Dark Mode
- **Forms**: react-hook-form + Zod با validation فارسی
- **Assets**: SVGR برای آیکون‌ها، next/image برای تصاویر
- **Performance**: React.memo، useMemo، useCallback، Lazy Loading
- **Accessibility**: ARIA، Keyboard Navigation، Screen Reader
- **Responsive**: Mobile-First با breakpoints استاندارد

پروژه از الگوهای مدرن React و best practices استفاده می‌کند و با پشتیبانی کامل از RTL و زبان فارسی طراحی شده است.
