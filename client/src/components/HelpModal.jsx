import React, { useState } from "react";
import { X, FileText } from "lucide-react";
import "../styles/HelpModal.css";

const HelpModal = ({ onClose }) => {

    const faqs = [
        {
            id: 1,
            question: "How do I create a new project?",
            answer: "Go to the Projects page and click the 'New Project' button in the top right corner. Fill in the details and click Create."
        },
        {
            id: 2,
            question: "Can I invite external members?",
            answer: "Yes! In your project settings, look for the 'Team' section. You can invite members via email."
        },
        {
            id: 3,
            question: "How do I change my theme?",
            answer: "Click the moon/sun icon in the top navigation bar to toggle between light and dark modes."
        },
        {
            id: 4,
            question: "Where can I see my tasks?",
            answer: "The Dashboard gives you an overview, but the 'Task Detail' page shows a comprehensive list of all your assigned tasks."
        }
    ];

    return (
        <div className="help-modal-overlay" onClick={onClose}>
            <div className="help-modal-content" onClick={e => e.stopPropagation()}>
                <button className="help-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="help-header">
                    <h2>How can we help?</h2>
                </div>

                <div className="help-body">
                    <section className="help-section">
                        <h3>Frequently Asked Questions</h3>
                        <div className="faq-list">
                            {faqs.map(faq => (
                                <div key={faq.id} className="faq-item">
                                    <div className="faq-question">
                                        <span className="icon-box"><FileText size={14} /></span>
                                        <h4>{faq.question}</h4>
                                    </div>
                                    <p className="faq-answer">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default HelpModal;
