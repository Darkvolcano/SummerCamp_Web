import { Html, useProgress } from "@react-three/drei";

const ModelLoader: React.FC = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 font-semibold">
          Đang tải mô hình 3D... {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
};

export default ModelLoader;
