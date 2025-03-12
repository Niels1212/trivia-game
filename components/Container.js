export default function Container({ children }) {
    return (
      <div className="bg-white text-black p-6 rounded-xl shadow-lg text-center w-[90%] max-w-[500px] md:w-[600px]">
        {children}
      </div>
    );
  }