from typing import Dict, List, TypedDict, Union


# Add type alias for API response
class ProfileCategoryResponseDict(TypedDict):
    display_name: str
    values: List[str]


ProfileCategoriesResponse = Dict[str, ProfileCategoryResponseDict]
# Alias for selected categories (user/job selection)
SelectedCategories = Dict[str, Union[str, List[str]]]

# Unified category configuration for profile categories, display names, values, and prompt fragments


class CategoryValue(TypedDict):
    value: str
    fragment: str


class CategoryDef(TypedDict):
    display_name: str
    values: List[CategoryValue]


CATEGORY_CONFIG: Dict[str, CategoryDef] = {
    "industry": {
        "display_name": "Industry",
        "values": [
            {
                "value": "Technology",
                "fragment": "Focus on software, hardware, IT industry standards, and emerging technologies.",
            },
            {
                "value": "Healthcare",
                "fragment": "Emphasize regulatory compliance, patient care, medical technology, and healthcare operations.",
            },
            {
                "value": "Finance",
                "fragment": "Highlight financial regulations, risk management, quantitative skills, and industry certifications.",
            },
            {
                "value": "Education",
                "fragment": "Showcase teaching, curriculum development, and educational technology expertise.",
            },
            {
                "value": "Manufacturing",
                "fragment": "Emphasize process optimization, quality control, and production management.",
            },
            {
                "value": "Retail",
                "fragment": "Highlight customer service, sales strategies, and inventory management.",
            },
            {
                "value": "Government",
                "fragment": "Focus on public policy, regulatory adherence, and civic responsibility.",
            },
            {
                "value": "Nonprofit",
                "fragment": "Emphasize mission-driven work, fundraising, and community engagement.",
            },
            {
                "value": "Energy",
                "fragment": "Highlight sustainability, energy management, and regulatory compliance.",
            },
            {
                "value": "Transportation",
                "fragment": "Showcase logistics, supply chain, and fleet management skills.",
            },
            {
                "value": "Hospitality",
                "fragment": "Emphasize guest experience, service excellence, and operations management.",
            },
            {
                "value": "__default__",
                "fragment": "Highlight relevant industry experience and adaptability to various sectors.",
            },
        ],
    },
    "function": {
        "display_name": "Function / Role",
        "values": [
            {
                "value": "Engineering/Development",
                "fragment": "Prioritize technical depth, coding skills, system design, and engineering best practices.",
            },
            {
                "value": "Product Management",
                "fragment": "Emphasize cross-functional leadership, product lifecycle, and stakeholder management.",
            },
            {
                "value": "Sales",
                "fragment": "Highlight relationship building, negotiation, and revenue generation.",
            },
            {
                "value": "Marketing",
                "fragment": "Showcase campaign management, digital marketing, and brand strategy.",
            },
            {
                "value": "Operations",
                "fragment": "Emphasize process improvement, resource allocation, and operational efficiency.",
            },
            {
                "value": "Human Resources",
                "fragment": "Highlight talent acquisition, employee relations, and HR compliance.",
            },
            {
                "value": "Finance/Accounting",
                "fragment": "Showcase financial analysis, reporting, and regulatory compliance.",
            },
            {
                "value": "Customer Support",
                "fragment": "Emphasize problem-solving, communication, and customer satisfaction.",
            },
            {
                "value": "Design/UX",
                "fragment": "Highlight creativity, user research, and design thinking.",
            },
            {
                "value": "Legal",
                "fragment": "Showcase legal research, compliance, and contract management.",
            },
            {
                "value": "Data Science/Analytics",
                "fragment": "Emphasize data analysis, statistical modeling, and actionable insights.",
            },
            {
                "value": "__default__",
                "fragment": "Emphasize core functional skills and ability to contribute across roles.",
            },
        ],
    },
    "seniority": {
        "display_name": "Seniority Level",
        "values": [
            {
                "value": "Entry Level",
                "fragment": "Focus on foundational skills, learning ability, and adaptability.",
            },
            {
                "value": "Associate",
                "fragment": "Highlight growing expertise, teamwork, and willingness to learn.",
            },
            {
                "value": "Mid Level",
                "fragment": "Showcase independent work, project contributions, and skill mastery.",
            },
            {
                "value": "Senior",
                "fragment": "Highlight leadership, mentorship, and high-impact project delivery.",
            },
            {
                "value": "Lead",
                "fragment": "Emphasize team leadership, strategic planning, and cross-functional collaboration.",
            },
            {
                "value": "Manager",
                "fragment": "Showcase people management, resource allocation, and performance tracking.",
            },
            {
                "value": "Director",
                "fragment": "Emphasize organizational leadership, vision, and departmental strategy.",
            },
            {
                "value": "Vice President",
                "fragment": "Highlight executive leadership, business development, and high-level decision making.",
            },
            {
                "value": "C-Level/Executive",
                "fragment": "Showcase company-wide leadership, vision, and strategic direction.",
            },
            {
                "value": "__default__",
                "fragment": "Showcase appropriate experience, growth, and leadership for the role's level.",
            },
        ],
    },
    "company_size": {
        "display_name": "Company Size / Stage",
        "values": [
            {
                "value": "Startup (1–50)",
                "fragment": "Emphasize adaptability, wearing multiple hats, and rapid growth environments.",
            },
            {
                "value": "Small Business (51–200)",
                "fragment": "Highlight close teamwork, flexibility, and hands-on experience.",
            },
            {
                "value": "Mid-size (201–1,000)",
                "fragment": "Showcase scalable processes, cross-team collaboration, and growth management.",
            },
            {
                "value": "Large (1,001–10,000)",
                "fragment": "Emphasize structured processes, departmental coordination, and resource management.",
            },
            {
                "value": "Enterprise (10,000+)",
                "fragment": "Highlight global operations, complex hierarchies, and large-scale impact.",
            },
            {
                "value": "__default__",
                "fragment": "Demonstrate adaptability to organizations of any size or stage.",
            },
        ],
    },
    "geography": {
        "display_name": "Geography / Region",
        "values": [
            {
                "value": "North America",
                "fragment": "Demonstrate familiarity with North American business practices and regulations.",
            },
            {
                "value": "Europe",
                "fragment": "Showcase understanding of European markets, languages, and compliance.",
            },
            {
                "value": "Asia-Pacific",
                "fragment": "Highlight experience with APAC markets, cultures, and business etiquette.",
            },
            {
                "value": "Latin America",
                "fragment": "Emphasize Spanish/Portuguese language skills and LATAM market knowledge.",
            },
            {
                "value": "Middle East & Africa",
                "fragment": "Showcase cross-cultural communication and regional expertise.",
            },
            {
                "value": "Remote",
                "fragment": "Highlight self-motivation, digital collaboration, and remote work best practices.",
            },
            {
                "value": "__default__",
                "fragment": "Highlight ability to work in diverse or global environments.",
            },
        ],
    },
    "special_requirements": {
        "display_name": "Special Requirements",
        "values": [
            {
                "value": "Security Clearance",
                "fragment": "Emphasize ability to work with sensitive information and pass background checks.",
            },
            {
                "value": "Certifications",
                "fragment": "Highlight relevant industry certifications and ongoing professional development.",
            },
            {
                "value": "Bilingual/Multilingual",
                "fragment": "Showcase language proficiency and ability to work in diverse environments.",
            },
            {
                "value": "Disability Accommodation",
                "fragment": "Demonstrate commitment to accessibility, inclusion, and workplace accommodations.",
            },
            {
                "value": "__default__",
                "fragment": "Show willingness and ability to meet any special requirements for the role.",
            },
        ],
    },
}
