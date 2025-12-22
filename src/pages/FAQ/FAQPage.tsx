import React, { useState } from "react";
import { Spin } from "antd";
import { HelpCircle, ChevronDown } from "lucide-react";
import faqService from "../../services/faqService";
import { useQuery } from "@tanstack/react-query";
import "./FAQPage.css";

const CustomerFAQPage: React.FC = () => {
    const { data: faqs = [], isLoading: loading } = useQuery({
        queryKey: ["faqs"],
        queryFn: () => faqService.getAllFaqs(),
    });

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleFaq = (faqId: number) => {
        setExpandedId(expandedId === faqId ? null : faqId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600 font-semibold">Đang tải câu hỏi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="faq-page bg-gradient-to-b from-gray-50 to-white min-h-screen">
            {/* Hero Section */}
            <section
                className="relative min-h-[500px] flex items-center justify-center overflow-hidden"
                style={{
                    background:
                        "linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(https://res.cloudinary.com/da9zmbssb/image/upload/v1760079496/GroupLearn_a1codk.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="relative z-10 px-4 max-w-6xl mx-auto text-center pt-20 pb-32">
                    <div className="flex justify-center mb-6">
                        <div className="bg-orange-400/20 p-6 rounded-full backdrop-blur-sm">
                            <HelpCircle size={64} className="text-orange-400" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                            Câu Hỏi Thường Gặp
                        </span>
                    </h1>
                    <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                        Tìm câu trả lời cho các thắc mắc phổ biến về chương trình trại hè của chúng tôi
                    </p>
                </div>
            </section>

            {/* FAQ Content */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                {faqs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">❓</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Chưa có câu hỏi nào
                        </h3>
                        <p className="text-gray-600">
                            Vui lòng quay lại sau
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isExpanded = expandedId === faq.faqId;
                            return (
                                <div
                                    key={faq.faqId}
                                    className="!bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-200"
                                >
                                    <button
                                        onClick={() => toggleFaq(faq.faqId)}
                                        className="w-full p-6 flex items-center gap-4 text-left bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className="text-xl font-bold text-gray-900 [&_p]:inline [&_strong]:text-orange-500"
                                                dangerouslySetInnerHTML={{ __html: faq.question }}
                                            />
                                        </div>
                                        <div className="flex-shrink-0">
                                            <ChevronDown
                                                size={24}
                                                className={`text-orange-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </div>
                                    </button>

                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                                            }`}
                                    >
                                        <div className="px-6 pb-6 pl-[88px]">
                                            <div className="pt-4 border-t-2 border-gray-100">
                                                <div
                                                    className="text-gray-700 leading-relaxed space-y-3 [&_p]:mb-3 [&_p]:leading-7 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_li]:mb-1.5 [&_strong]:text-gray-900 [&_strong]:font-semibold [&_a]:text-orange-500 [&_a]:hover:text-orange-600 [&_a]:underline"
                                                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-orange-400 to-yellow-400 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Không tìm thấy câu trả lời?
                    </h2>
                    <p className="text-white/90 mb-8 text-lg">
                        Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-white text-orange-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                        Liên Hệ Chúng Tôi
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CustomerFAQPage;
