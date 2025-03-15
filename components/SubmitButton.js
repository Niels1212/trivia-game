export default function SubmitButton({ onClick }) {
    return (
      <button
        onClick={onClick}
        className="mt-6 px-6 py-3 text-lg font-semibold bg-blue-600 text-white rounded-lg shadow-md transition duration-300 w-full"
      >
        Submit Answer ✅
      </button>
    );
  }
  