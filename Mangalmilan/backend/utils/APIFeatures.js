// utils/APIFeatures.mjs

export class APIFeatures {
    constructor(query, queryString) {
        this.query = query; 
        this.queryString = queryString; 
    }

    search() {
        const keyword = this.queryString.q ? {
            businessName: {
                $regex: this.queryString.q,
                $options: 'i',
            },
        } : {};
        
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryString };
        
        const removeFields = ['q', 'page', 'limit', 'sort'];
        removeFields.forEach(el => delete queryCopy[el]);

        let filterConditions = {};

        if (queryCopy.category) {
           
            filterConditions.category = queryCopy.category;
            delete queryCopy.category;
        }

        if (queryCopy.city) {
            filterConditions['location.city'] = { 
                $regex: queryCopy.city, 
                $options: 'i' 
            };
            delete queryCopy.city;
        }


        let rangeQuery = JSON.stringify(queryCopy);
        rangeQuery = rangeQuery.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        
        this.query = this.query.find({ 
            ...filterConditions,
            ...JSON.parse(rangeQuery) 
        });

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-averageRating'); 
        }
        return this;
    }

    paginate() {
        const page = parseInt(this.queryString.page) || 1;
        const limit = parseInt(this.queryString.limit) || 20;
        const skip = (page - 1) * limit;

        this.query = this.query.limit(limit).skip(skip);
        return this;
    }
}