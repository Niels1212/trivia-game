// components/Button.js
export default function Button({ onClick, children, variant = "primary", disabled = false }) {
    const baseClass = "mt-6 px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition duration-300 w-full";
    
    // Define styles for variants
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-800 text-white",
      danger: "bg-red-600 hover:bg-red-800 text-white",
      success: "bg-green-600 hover:bg-green-800 text-white",
      warning: "bg-orange-600 hover:bg-orange-800 text-white",
    };
  
    // Disabled style
    const disabledClass = "bg-gray-400 text-gray-800 cursor-not-allowed";
    const variantClass = disabled ? disabledClass : (variants[variant] || "");
  
    return (
      <button onClick={onClick} className={`${baseClass} ${variantClass}`} disabled={disabled}>
        {children}
      </button>
    );
  }