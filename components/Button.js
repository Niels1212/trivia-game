// components/Button.js
export default function Button({ onClick, children, variant = "primary", disabled = false, className = "" }) {
    const baseClass = "px-6 py-2 text-lg font-semibold rounded-lg shadow-md transition duration-300 w-full";
    
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-800 text-white",
      danger: "bg-red-600 hover:bg-red-800 text-white",
      success: "bg-green-600 hover:bg-green-800 text-white",
      warning: "bg-orange-600 hover:bg-orange-800 text-white",
      purple: "bg-purple-600 hover:bg-purple-800 text-white",
    };
  
    const disabledClass = "bg-gray-400 text-gray-800 cursor-not-allowed";
    const variantClass = disabled ? disabledClass : (variants[variant] || "");
  
    return (
      <button onClick={onClick} className={`${baseClass} ${variantClass} ${className}`} disabled={disabled}>
        {children}
      </button>
    );
  }
  